// The options of mcpStart and mcpCall (#526) against the notify fixture
// (unotest/fixtures/mcp/notify-server.mjs): `whoami` reports its working
// directory and DOGFOOD_MCP_TAG, `fail` answers isError, `slow` answers
// late, `--start-delay` holds the handshake back. Each key beside its
// control: the same call without it reads differently.

function whoami(srv) {
  return parseJson(mcpCall(srv, 'whoami').content[0].text);
}

function test_mcp_start_options() {
  step("No options: the server runs in the project, without our tag", () => {
    const srv = mcpStart('node', ['unotest/fixtures/mcp/notify-server.mjs']);
    const me = whoami(srv);
    assertTrue(!textContains(me.cwd, 'fixtures/mcp'), me.cwd);
    assertEqual(me.tag, null);
    mcpStop(srv);
  });

  step("{cwd} starts it in that folder: the script is found by its bare name", () => {
    const srv = mcpStart('node', ['notify-server.mjs'], {cwd: 'unotest/fixtures/mcp'});
    assertTrue(textContains(whoami(srv).cwd, 'unotest/fixtures/mcp'), whoami(srv).cwd);
    mcpStop(srv);
  });

  step("{env} adds the variable to what the server inherits", () => {
    const srv = mcpStart('node', ['unotest/fixtures/mcp/notify-server.mjs'], {env: {DOGFOOD_MCP_TAG: 'tagged'}});
    assertEqual(whoami(srv).tag, 'tagged');
    mcpStop(srv);
  });

  step("A 2 s handshake: {timeoutMs: 700} gives up, {timeoutMs: 5000} waits it out", () => {
    const message = caught_message(() => mcpStart('node', ['unotest/fixtures/mcp/notify-server.mjs', '--start-delay', '2000'], {timeoutMs: 700}));
    assertTrue(textContains(message, '700'), message);
    const srv = mcpStart('node', ['unotest/fixtures/mcp/notify-server.mjs', '--start-delay', '2000'], {timeoutMs: 5000});
    assertEqual(whoami(srv).tag, null);
    mcpStop(srv);
  });
}

function test_mcp_call_options() {
  let srv;
  step("Start the fixture", () => {
    srv = mcpStart('node', ['unotest/fixtures/mcp/notify-server.mjs']);
  });

  step("An isError result fails the step; {allowError: true} hands it back", () => {
    const message = caught_message(() => mcpCall(srv, 'fail'));
    assertTrue(textContains(message, 'the tool failed on purpose'), message);
    const res = mcpCall(srv, 'fail', {}, {allowError: true});
    assertTrue(res.isError, json(res));
  });

  step("A 2 s answer: {timeoutMs: 700} gives up, {timeoutMs: 5000} gets it", () => {
    const message = caught_message(() => mcpCall(srv, 'slow', {ms: 2000}, {timeoutMs: 700}));
    assertTrue(textContains(message, '700'), message);
    assertEqual(mcpCall(srv, 'slow', {ms: 2000}, {timeoutMs: 5000}).content[0].text, 'late');
    mcpStop(srv);
  });
}
