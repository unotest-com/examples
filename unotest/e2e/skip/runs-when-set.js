// Control for skip/skip-when-unset: the same decision on a variable the
// stand does have, so the test runs to the end and passes.

function test_runs_when_the_target_is_set() {
  skip('APP_BASE_URL is not set', env('APP_BASE_URL') == null);

  step("The target is there, the check runs", () => {
    goto(env('APP_BASE_URL'));
    waitForText('Stress-test browser');
  });
}
