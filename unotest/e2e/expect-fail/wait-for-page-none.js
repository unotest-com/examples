// @expect-fail
// Deliberate failure, the control of accept-045/wait-for-page: nothing
// opens a tab, so waitForPage must fail with its own words and the count
// of tabs — not with a generic timeout.

function test_wait_for_page_nothing_opens() {
  step("Open the clicks scenario", () => {
    goto('/scenarios/clicks');
    waitFor(getByRole('button', {name: 'Open popup'}));
  });

  step("Wait for a tab nobody opens", () => {
    waitForPage({timeoutMs: 3000});
  });
}
