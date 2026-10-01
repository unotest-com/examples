// @expect-fail
// Deliberate failure (timeout-option): {timeout} and {timeoutMs} are one
// option — both at once is refused before anything waits, not resolved by
// picking one.

function test_timeout_both_keys_refused() {
  step("Open the home page", () => {
    goto('/');
    waitForText('Stress-test browser', {timeout: 1000});
  });

  step("Give the wait both names of its timeout", () => {
    waitForText('Stress-test browser', {timeout: 1000, timeoutMs: 2000});
  });
}
