// Deliberate error (timeout-option): {timeout} and {timeoutMs} are one
// option — both at once is refused, not resolved by picking one: by lint,
// and by `e2e` before the browser starts.
// A wrong call of the script checks nothing: it is an error of the
// scenario, not a failed check, so it carries no @expect-fail
// (dogfood-expect-fail.mjs holds it as a refused case). Outside
// unotest/e2e/: red for good, it would sit in the viewer's "Failing now"
// and hide real failures.

function test_timeout_both_keys_refused() {
  step("Open the home page", () => {
    goto('/');
    waitForText('Stress-test browser', {timeout: 1000});
  });

  step("Give the wait both names of its timeout", () => {
    waitForText('Stress-test browser', {timeout: 1000, timeoutMs: 2000});
  });
}
