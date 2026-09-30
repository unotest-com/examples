// Support thread for the second-context scenario (#197): two browser
// contexts of the same user open one ticket, the first closes it, the
// second writes into the closed thread and is told so.
//
// The state both clients must see lives HERE, on the server — a thread
// kept in localStorage would be invisible to the other context, which is
// the whole point of the scenario. Sessions are per browser context (a
// cookie), so each context has to sign in on its own.
//
// Same rules as the rest of this fixture: in memory, capped, a restart is
// a legal reset, and `POST /support/reset` resets on demand so two runs in
// a row start from an open ticket.

import { randomUUID } from "node:crypto";

const MAX_SESSIONS = 1_000;
const MAX_THREADS = 200;
const MAX_MESSAGES = 50;
const MAX_MESSAGE_CHARS = 2_000;

/** Credentials: checked only when the fixture is started with them. The
 *  public instance runs without, and any non-empty pair signs in — the
 *  scenario proves isolation of sessions, not a password check. */
const EXPECTED_LOGIN = process.env.SUPPORT_LOGIN ?? "";
const EXPECTED_PASSWORD = process.env.SUPPORT_PASSWORD ?? "";

/** sid → login. Insertion order doubles as age for the cap. */
const sessions = new Map();
/** thread id → { closed, messages: string[] } */
const threads = new Map();

function thread(id) {
  let t = threads.get(id);
  if (!t) {
    t = { closed: false, messages: [] };
    threads.set(id, t);
    while (threads.size > MAX_THREADS) threads.delete(threads.keys().next().value);
  }
  return t;
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function page(res, status, title, body, headers = {}) {
  const html =
    `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
    `<title>${escapeHtml(title)}</title></head><body>${body}</body></html>`;
  res.writeHead(status, {
    "content-type": "text/html; charset=utf-8",
    "content-length": Buffer.byteLength(html),
    "cache-control": "no-store",
    ...headers,
  });
  res.end(html);
}

function redirect(res, location, headers = {}) {
  res.writeHead(303, { location, "cache-control": "no-store", ...headers });
  res.end();
}

function sessionOf(req) {
  const sid = /(?:^|;\s*)support_sid=([^;]+)/.exec(req.headers.cookie ?? "")?.[1];
  return sid !== undefined && sessions.has(sid) ? sessions.get(sid) : undefined;
}

async function form(req, readBody) {
  return new URLSearchParams((await readBody(req)).toString("utf8"));
}

function loginPage(res, status, next, error = "") {
  return page(
    res,
    status,
    "Support — sign in",
    `<h1>Support</h1>` +
      (error ? `<p role="alert">${escapeHtml(error)}</p>` : "") +
      `<form method="post" action="/support/login">` +
      `<input type="hidden" name="next" value="${escapeHtml(next)}">` +
      `<p><label for="login">Login</label> <input id="login" name="login" autocomplete="username"></p>` +
      `<p><label for="password">Password</label> <input id="password" name="password" type="password" autocomplete="current-password"></p>` +
      `<p><button type="submit">Sign in</button></p></form>`,
  );
}

function threadPage(res, status, id, login, notice = "") {
  const t = thread(id);
  const messages = t.messages.map((m) => `<li>${escapeHtml(m)}</li>`).join("");
  return page(
    res,
    status,
    `Ticket #${id}`,
    `<h1>Ticket #${escapeHtml(id)}</h1>` +
      `<p>Signed in as ${escapeHtml(login)}</p>` +
      `<p>Status: <strong data-testid="status">${t.closed ? "Closed" : "Open"}</strong></p>` +
      (notice ? `<p role="alert">${escapeHtml(notice)}</p>` : "") +
      `<ul aria-label="Messages">${messages}</ul>` +
      `<form method="post" action="/support/thread/${escapeHtml(id)}/messages">` +
      `<label for="message">Message</label> <input id="message" name="message">` +
      ` <button type="submit">Send</button></form>` +
      (t.closed
        ? ""
        : `<form method="post" action="/support/thread/${escapeHtml(id)}/close">` +
          `<button type="submit">Close ticket</button></form>`),
  );
}

/** Handle `/support/*`. Returns false for any other path, so the caller
 *  keeps its own routing and 404. */
export async function supportRoute(req, res, path, readBody) {
  if (path !== "/support" && !path.startsWith("/support/")) return false;

  if (path === "/support/reset" && req.method === "POST") {
    threads.clear();
    res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ reset: true }));
    return true;
  }

  if (path === "/support/login" && req.method === "GET") {
    const next = new URL(req.url ?? "/", "http://x").searchParams.get("next") ?? "/support";
    loginPage(res, 200, next);
    return true;
  }

  if (path === "/support/login" && req.method === "POST") {
    const body = await form(req, readBody);
    const login = (body.get("login") ?? "").trim();
    const password = body.get("password") ?? "";
    // Only a support page is a legal landing: an open redirect on a public
    // fixture would be a gift to anyone who finds it.
    const asked = body.get("next") ?? "";
    const next = asked.startsWith("/support") ? asked : "/support";
    const wrong =
      login === "" ||
      password === "" ||
      (EXPECTED_LOGIN !== "" && login !== EXPECTED_LOGIN) ||
      (EXPECTED_PASSWORD !== "" && password !== EXPECTED_PASSWORD);
    if (wrong) {
      loginPage(res, 401, next, "Wrong login or password");
      return true;
    }
    const sid = randomUUID();
    sessions.set(sid, login);
    while (sessions.size > MAX_SESSIONS) sessions.delete(sessions.keys().next().value);
    redirect(res, next, { "set-cookie": `support_sid=${sid}; Path=/support; HttpOnly; SameSite=Lax` });
    return true;
  }

  const login = sessionOf(req);
  if (login === undefined) {
    redirect(res, `/support/login?next=${encodeURIComponent(path)}`);
    return true;
  }

  if (path === "/support" && req.method === "GET") {
    page(res, 200, "Support", `<h1>Support</h1><p>Signed in as ${escapeHtml(login)}</p>`);
    return true;
  }

  const match = /^\/support\/thread\/([A-Za-z0-9_-]{1,40})(\/messages|\/close)?$/.exec(path);
  if (!match) {
    page(res, 404, "Not found", `<h1>Not found</h1><p>No support page at ${escapeHtml(path)}</p>`);
    return true;
  }
  const [, id, action] = match;

  if (action === undefined && req.method === "GET") {
    threadPage(res, 200, id, login);
    return true;
  }
  if (action === "/close" && req.method === "POST") {
    thread(id).closed = true;
    redirect(res, `/support/thread/${id}`);
    return true;
  }
  if (action === "/messages" && req.method === "POST") {
    const text = ((await form(req, readBody)).get("message") ?? "").slice(0, MAX_MESSAGE_CHARS);
    const t = thread(id);
    if (t.closed) {
      threadPage(res, 409, id, login, "This ticket is closed");
      return true;
    }
    if (text.trim() !== "") {
      t.messages.push(`${login}: ${text}`);
      if (t.messages.length > MAX_MESSAGES) t.messages.shift();
    }
    redirect(res, `/support/thread/${id}`);
    return true;
  }

  page(res, 405, "Not allowed", `<h1>${escapeHtml(req.method ?? "")} not allowed on ${escapeHtml(path)}</h1>`);
  return true;
}
