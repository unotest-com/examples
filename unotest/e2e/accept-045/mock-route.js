// Acceptance #289 on the pilot's path: demo-kit's allowlist
// (e2e/helpers/extension.ts — route('**/*'): continue for the own site,
// abort and remember the rest, fail the test if anything left) and its
// Last Message interception (e2e/last-message.spec.ts — fulfill 200 [] /
// 500, read the roomIds the extension asked for). The site here is the
// real playground, not a mocked page: its own origin must pass untouched.

function test_mock_route_on_the_pilot_path() {
  step("Allowlist: everything aborted and recorded, the site passes", () => {
    ASK = "(room) => fetch('https://api.watchers.test/room/last-message/load', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({roomIds: [room]})}).then(async (r) => ({status: r.status, text: await r.text()}))";
    mockRoute('**/*', {abort: true, record: true});
    mockRoute('https://playground.unotest.com/**', {continue: true});
    goto('/');
    waitForText('Stress-test browser');
  });

  step("Last Message answers an empty room", () => {
    mockRoute('**/room/last-message/load', {status: 200, contentType: 'application/json; charset=utf-8', body: []});
    res = evaluate(ASK, 'feed-7'); // lint-ok: stands in for the extension's own fetch to its prod API
    assertTrue(res.status == 200, 'status: ' + res.status);
    assertTrue(res.text == '[]', 'body: ' + res.text);
  });

  step("The request carried the feed room", () => {
    req = waitForRequest('**/room/last-message/load', {timeoutMs: 5000});
    assertTrue(req.method == 'POST', 'method: ' + req.method);
    assertTrue(req.postDataJson.roomIds[0] == 'feed-7', 'body: ' + req.postData);
  });

  step("Backend down: the same mask answers 500", () => {
    mockRoute('**/room/last-message/load', {status: 500, body: {error: 'backend down'}});
    res = evaluate(ASK, 'feed-7'); // lint-ok: stands in for the extension's own fetch to its prod API
    assertTrue(res.status == 500, 'status: ' + res.status);
    assertTrue(textContains(res.text, 'backend down'), 'body: ' + res.text);
  });

  step("Nothing left the sandbox", () => {
    assertNoRequest('**/*');
  });
}
