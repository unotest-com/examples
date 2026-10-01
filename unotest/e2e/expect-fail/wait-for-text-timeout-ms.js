// @expect-fail
// Deliberate failure (timeout-option): {timeoutMs} on an older wait is the
// same option as {timeout} — waitForText gives up after the 1000 ms asked
// for, not after the run's default.

function test_wait_for_text_honours_timeout_ms() {
  step("Open the home page", () => {
    goto('/');
    waitForText('Stress-test browser', {timeoutMs: 1000});
  });

  step("Wait for text nobody shows", () => {
    waitForText('no such text anywhere', {timeoutMs: 1000});
  });
}
