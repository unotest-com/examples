// @expect-fail
// Deliberate failure, the control of accept-045/mock-route: under the same
// allowlist the page reaches a host nobody allowed. The recording abort
// must stop it AND assertNoRequest must name it — a bare abort would hide
// the leak and pass.

function test_mock_route_escaped_request() {
  step("Allowlist: everything aborted and recorded, the site passes", () => {
    mockRoute('**/*', {abort: true, record: true});
    mockRoute('https://playground.unotest.com/**', {continue: true});
    goto('/');
    waitForText('Stress-test browser');
  });

  step("The page calls a host outside the allowlist", () => {
    got = evaluate(`() => fetch('https://tracker.watchers.test/pixel').then(() => 'reached', () => 'blocked')`); // lint-ok: stands in for a stray request the extension makes
    assertTrue(got == 'blocked', 'the stray request: ' + got);
  });

  step("Nothing left the sandbox", () => {
    assertNoRequest('**/*');
  });
}
