#!/usr/bin/env node
// A stdio MCP server that sends notifications — the dogfood suite's own
// MCP server (`unotest-web mcp`) sends none, and mcpWaitNotification needs
// something to wait for. Plain JSON-RPC, one message per line, no
// dependencies: the file travels with the suite to the examples mirror.
//
// Tool `notify {text}`: sends `notifications/message` with
// {level: 'info', data: {text}}, then answers with the text.
// Tool `whoami`: its working directory and DOGFOOD_MCP_TAG from its env.
// Tool `fail`: a result marked isError. Tool `slow {ms}`: answers late.
// `--start-delay <ms>`: answers nothing before that, the handshake included.
import { createInterface } from "node:readline";

const at = process.argv.indexOf("--start-delay");
const ready = new Promise((resolve) => setTimeout(resolve, at < 0 ? 0 : Number(process.argv[at + 1])));
const send = (message) => process.stdout.write(JSON.stringify({ jsonrpc: "2.0", ...message }) + "\n");

const handlers = {
  initialize: (params) => ({
    protocolVersion: params.protocolVersion,
    capabilities: { tools: {} },
    serverInfo: { name: "dogfood-notify", version: "1" },
  }),
  ping: () => ({}),
  "tools/list": () => ({ tools: ["notify", "whoami", "fail", "slow"].map((name) => ({ name, inputSchema: { type: "object" } })) }),
  "tools/call": async (params) => {
    if (params.name === "whoami") return { content: [{ type: "text", text: JSON.stringify({ cwd: process.cwd(), tag: process.env.DOGFOOD_MCP_TAG ?? null }) }] };
    if (params.name === "fail") return { content: [{ type: "text", text: "the tool failed on purpose" }], isError: true };
    if (params.name === "slow") {
      await new Promise((resolve) => setTimeout(resolve, Number(params.arguments?.ms ?? 0)));
      return { content: [{ type: "text", text: "late" }] };
    }
    if (params.name !== "notify") throw new Error(`unknown tool ${params.name}`);
    const text = String(params.arguments?.text ?? "");
    send({ method: "notifications/message", params: { level: "info", data: { text } } });
    return { content: [{ type: "text", text }] };
  },
};

createInterface({ input: process.stdin }).on("line", async (line) => {
  await ready;
  if (line.trim() === "") return;
  const message = JSON.parse(line);
  // A notification from the client (notifications/initialized) wants no answer.
  if (message.id === undefined) return;
  const handler = handlers[message.method];
  if (handler === undefined) {
    send({ id: message.id, error: { code: -32601, message: `method not found: ${message.method}` } });
    return;
  }
  try {
    send({ id: message.id, result: await handler(message.params ?? {}) });
  } catch (e) {
    send({ id: message.id, error: { code: -32603, message: e.message } });
  }
});
