// #507: the scenario as an MCP client. Our own MCP server, started the way
// a consumer starts it (the bin in the project's node_modules), answers a
// tool that needs no browser; the notify fixture sends the notifications
// our server never does. The second test is the control: a {match} that
// nothing matches must go red on its timeout, quoting the last message.

function test_mcp_client_against_our_server() {
  step("Our MCP server lists the runtimes over stdio", () => {
    const srv = mcpStart('node_modules/.bin/unotest-web', ['mcp']);
    const res = mcpCall(srv, 'list_runtimes');
    assertTrue(res.isError != true, json(res));
    assertTrue(res.content.length > 0, json(res));
    mcpStop(srv);
  });
  step("A notification set off by a call is waited for by its params", () => {
    const notifier = mcpStart('node', ['unotest/fixtures/mcp/notify-server.mjs']);
    const answer = mcpCall(notifier, 'notify', {text: 'second'});
    assertTrue(answer.content[0].text == 'second', json(answer));
    mcpCall(notifier, 'notify', {text: 'first'});
    const got = mcpWaitNotification(notifier, 'notifications/message', {match: {'data.text': 'first'}});
    assertTrue(got.level == 'info', json(got));
    // The one that did not match is still there, handed out once.
    const other = mcpWaitNotification(notifier, 'notifications/message', {timeoutMs: 2000});
    assertTrue(other.data.text == 'second', json(other));
  });
}

// @expect-fail
// No notification carries this text: the wait runs out, the test is red,
// the error ends with the server's last MCP message, and the server it
// never stopped is stopped all the same.
function test_mcp_wait_without_a_match_goes_red() {
  step("Wait for a notification nothing sends", () => {
    const notifier = mcpStart('node', ['unotest/fixtures/mcp/notify-server.mjs']);
    mcpCall(notifier, 'notify', {text: 'only this'});
    mcpWaitNotification(notifier, 'notifications/message', {match: {'data.text': 'never sent'}, timeoutMs: 1000});
  });
}
