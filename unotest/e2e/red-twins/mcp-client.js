// Red twins (#449) of the MCP client's options. A stdio server written
// inline answers what the twins need: its environment, its directory, a
// slow tool, a tool that reports an error, a notification. A wait or a
// call with a short timeoutMs must fail by it, well before the default;
// env and cwd must change what the server says. The same call on the
// right state passes next to each; servers stop when the test ends.

function twin_server() {
  return 'const send = (m) => process.stdout.write(JSON.stringify({jsonrpc: "2.0", ...m}) + "\\n");' +
    'const text = (t) => ({content: [{type: "text", text: t}]});' +
    'const tools = {' +
    ' env: () => text(process.env.TWIN_VAR || "unset"),' +
    ' cwd: () => text(require("node:path").basename(process.cwd())),' +
    ' slow: () => new Promise((r) => setTimeout(() => r(text("late")), 3000)),' +
    ' broken: () => ({...text("twin-broken"), isError: true}),' +
    ' notify: (a) => { send({method: "notifications/message", params: {data: {text: a.text}}}); return text(a.text); },' +
    '};' +
    'require("node:readline").createInterface({input: process.stdin}).on("line", async (line) => {' +
    ' const m = JSON.parse(line); if (m.id === undefined) return;' +
    ' if (m.method === "initialize") return send({id: m.id, result: {protocolVersion: m.params.protocolVersion, capabilities: {tools: {}}, serverInfo: {name: "twins", version: "1"}}});' +
    ' if (m.method === "tools/call") return send({id: m.id, result: await tools[m.params.name](m.params.arguments || {})});' +
    ' send({id: m.id, result: {}});' +
    '});';
}

function start_twin_server() {
  return mcpStart('node', ['-e', twin_server()]);
}

function said(server, tool) {
  return mcpCall(server, tool).content[0].text;
}

function test_mcp_start_twins() {
  step("env: the server sees the variable it was started with", () => {
    assert_failed_with(caught_message(() => assertEqual(said(mcpStart('node', ['-e', twin_server()], {env: {TWIN_VAR: 'from-env'}}), 'env'), 'unset')), 'got "from-env"');
    assertEqual(said(mcpStart('node', ['-e', twin_server()], {env: {TWIN_VAR: 'from-env'}}), 'env'), 'from-env');
  });

  step("cwd: the server runs in the directory it was given", () => {
    const home = said(start_twin_server(), 'cwd');
    assert_failed_with(caught_message(() => assertEqual(said(mcpStart('node', ['-e', twin_server()], {cwd: 'unotest/e2e'}), 'cwd'), home)), 'got "e2e"');
    assertEqual(said(mcpStart('node', ['-e', twin_server()], {cwd: 'unotest/e2e'}), 'cwd'), 'e2e');
  });

  step("timeoutMs: a server that never answers the handshake fails in time", () => {
    const started = nowMs();
    assert_failed_with(caught_message(() => mcpStart('node', ['-e', 'setInterval(() => {}, 1000)'], {timeoutMs: 300})), 'mcpStart');
    assert_failed_in_time(started, 'mcpStart');
    mcpStart('node', ['-e', twin_server()], {timeoutMs: 10000});
  });
}

function test_mcp_call_twins() {
  let server;
  step("Start the server", () => { server = start_twin_server(); });

  step("timeoutMs: a slow tool fails in time, a quick one answers", () => {
    const started = nowMs();
    assert_failed_with(caught_message(() => mcpCall(server, 'slow', {}, {timeoutMs: 300})), 'mcpCall');
    assert_failed_in_time(started, 'mcpCall');
    assertEqual(said(server, 'env'), 'unset');
  });

  step("allowError: an error result fails the call, allowed it comes back", () => {
    assert_failed_with(caught_message(() => mcpCall(server, 'broken', {}, {allowError: false})), 'twin-broken');
    assertTrue(mcpCall(server, 'broken', {}, {allowError: true}).isError == true, 'the error result did not come back');
  });
}

function test_mcp_notification_twins() {
  let server;
  step("Start the server and have it send one notification", () => {
    server = start_twin_server();
    mcpCall(server, 'notify', {text: 'first'});
  });

  step("match and timeoutMs: a notification nothing sends fails in time, naming the one that came", () => {
    const started = nowMs();
    assert_failed_with(caught_message(() => mcpWaitNotification(server, 'notifications/message', {match: {'data.text': 'never sent'}, timeoutMs: 300})), 'first');
    assert_failed_in_time(started, 'mcpWaitNotification');
    assertEqual(mcpWaitNotification(server, 'notifications/message', {match: {'data.text': 'first'}, timeoutMs: 300}).data.text, 'first');
  });
}
