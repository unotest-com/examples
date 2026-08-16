#!/usr/bin/env node
// HTTP fixture for the dogfood suite — the backend `apiCall()` and
// `upload()` talk to. The playground is browser-only (its mocks live in a
// service worker and are unreachable from Node), so the sandbox primitives
// need their own responder.
//
// Deployed at https://fixtures.unotest.com, same way as the playground; the
// very same file serves a local run (`node unotest/fixtures/api/server.mjs`).
//
// Deliberately dependency-free (node:http + node:crypto): it must start on a
// bare Node 20 box with no install step.
//
// Public instance, so nothing here may accumulate: state is in-memory, every
// record expires, bodies are capped, and a restart is a legal reset. Test
// isolation comes from the caller — each scenario tags its records with a
// random marker and only ever reads its own back.

import { createServer } from "node:http";
import { createHash, randomUUID } from "node:crypto";

const PORT = Number(process.env.PORT ?? 8787);
const HOST = process.env.HOST ?? "127.0.0.1";
const ITEM_TTL_MS = Number(process.env.ITEM_TTL_MS ?? 60 * 60 * 1000);
const MAX_ITEMS = Number(process.env.MAX_ITEMS ?? 5_000);
const MAX_BODY_BYTES = Number(process.env.MAX_BODY_BYTES ?? 2 * 1024 * 1024);

/** id → item. Swept on every request; a restart is a legal reset. */
const items = new Map();

function sweep() {
  const cutoff = Date.now() - ITEM_TTL_MS;
  for (const [id, item] of items) {
    if (item.createdAt < cutoff) items.delete(id);
  }
  // Hard ceiling in case one client floods faster than the TTL clears.
  while (items.size > MAX_ITEMS) items.delete(items.keys().next().value);
}

function send(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
    "access-control-allow-origin": "*",
  });
  res.end(body);
}

function fail(res, status, message) {
  send(res, status, { error: message });
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      const e = new Error(`body exceeds ${MAX_BODY_BYTES} bytes`);
      e.status = 413;
      throw e;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function parseJson(buf) {
  if (buf.length === 0) return {};
  try {
    return JSON.parse(buf.toString("utf8"));
  } catch {
    const e = new Error("body is not valid JSON");
    e.status = 400;
    throw e;
  }
}

/** Minimal multipart/form-data reader: splits on the boundary and pulls
 *  `name` / `filename` / `content-type` out of each part's headers. Enough
 *  to prove `upload()` put the file on the wire correctly. */
function parseMultipart(buf, contentType) {
  const marker = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType ?? "");
  const boundary = marker?.[1] ?? marker?.[2];
  if (!boundary) {
    const e = new Error("multipart body without a boundary");
    e.status = 400;
    throw e;
  }
  const sep = Buffer.from(`--${boundary}`);
  const fields = {};
  const files = [];
  let pos = buf.indexOf(sep);
  while (pos !== -1) {
    const start = pos + sep.length;
    if (buf.slice(start, start + 2).toString() === "--") break; // closing
    const next = buf.indexOf(sep, start);
    if (next === -1) break;
    // Part = CRLF headers CRLFCRLF body CRLF
    const part = buf.slice(start + 2, next - 2);
    const split = part.indexOf("\r\n\r\n");
    if (split === -1) break;
    const headers = part.slice(0, split).toString("utf8");
    const content = part.slice(split + 4);
    const name = /name="([^"]*)"/i.exec(headers)?.[1] ?? "";
    const filename = /filename="([^"]*)"/i.exec(headers)?.[1];
    if (filename === undefined) {
      fields[name] = content.toString("utf8");
    } else {
      files.push({
        field: name,
        filename,
        contentType: /content-type:\s*([^\r\n]+)/i.exec(headers)?.[1] ?? "",
        size: content.length,
        sha256: createHash("sha256").update(content).digest("hex"),
      });
    }
    pos = next;
  }
  return { fields, files };
}

const STARTED_AT = Date.now();

async function route(req, res, url) {
  const path = url.pathname.replace(/\/+$/, "") || "/";

  if (req.method === "GET" && (path === "/" || path === "/health")) {
    return send(res, 200, {
      service: "unotest-fixtures-api",
      ok: true,
      uptimeMs: Date.now() - STARTED_AT,
      items: items.size,
    });
  }

  if (path === "/items" && req.method === "POST") {
    const body = parseJson(await readBody(req));
    if (typeof body.marker !== "string" || body.marker.length === 0) {
      return fail(res, 400, "marker is required — tag every record so runs stay isolated");
    }
    const item = {
      id: randomUUID(),
      marker: body.marker,
      name: typeof body.name === "string" ? body.name : "",
      qty: Number.isFinite(body.qty) ? Number(body.qty) : 0,
      createdAt: Date.now(),
    };
    items.set(item.id, item);
    return send(res, 201, item);
  }

  if (path === "/items" && req.method === "GET") {
    const marker = url.searchParams.get("marker");
    if (!marker) return fail(res, 400, "marker query parameter is required");
    const mine = [...items.values()].filter((i) => i.marker === marker);
    return send(res, 200, { count: mine.length, items: mine });
  }

  const byId = /^\/items\/([^/]+)$/.exec(path);
  if (byId) {
    const item = items.get(byId[1]);
    if (!item) return fail(res, 404, `no item ${byId[1]}`);
    if (req.method === "GET") return send(res, 200, item);
    if (req.method === "PATCH") {
      const body = parseJson(await readBody(req));
      if (typeof body.name === "string") item.name = body.name;
      if (Number.isFinite(body.qty)) item.qty = Number(body.qty);
      return send(res, 200, item);
    }
    if (req.method === "DELETE") {
      items.delete(item.id);
      return send(res, 200, { deleted: item.id });
    }
    return fail(res, 405, `${req.method} not allowed on ${path}`);
  }

  if (path === "/echo") {
    const raw = await readBody(req);
    const isJson = (req.headers["content-type"] ?? "").includes("application/json");
    return send(res, 200, {
      method: req.method,
      query: Object.fromEntries(url.searchParams),
      headers: req.headers,
      body: isJson ? parseJson(raw) : raw.toString("utf8"),
    });
  }

  const status = /^\/status\/(\d{3})$/.exec(path);
  if (status) {
    const code = Number(status[1]);
    return send(res, code, { status: code, requested: url.pathname });
  }

  if (path === "/upload" && req.method === "POST") {
    const raw = await readBody(req);
    const { fields, files } = parseMultipart(raw, req.headers["content-type"]);
    return send(res, 201, { fields, files, totalBytes: raw.length });
  }

  return fail(res, 404, `no route for ${req.method} ${path}`);
}

const server = createServer((req, res) => {
  sweep();
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  route(req, res, url).catch((e) => {
    fail(res, e?.status ?? 500, e instanceof Error ? e.message : String(e));
  });
});

server.listen(PORT, HOST, () => {
  const addr = server.address();
  process.stdout.write(`unotest-fixtures-api listening on http://${HOST}:${addr.port}\n`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => server.close(() => process.exit(0)));
}
