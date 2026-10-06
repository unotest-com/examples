// @expect-fail
// Deliberate failure: a test whose own budget (setTestTimeout) runs out in
// the middle of a wait must fail at once, naming the budget it spent — not
// when the wait ends, and not as a stopped run.

function test_test_timeout_cuts_the_wait() {
  setTestTimeout(3000);

  step("Wait longer than the test's budget", () => {
    goto('/');
    waitForText('Stress-test browser');
    assertNeverAppears(getByText('This text is never on the hub'), {withinMs: 20000});
  });
}
