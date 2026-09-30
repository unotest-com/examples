// @expect-fail
// Deliberate failure: the call that "turns the stand on" fails, and the
// teardown registered BEFORE it still runs. The verdict is the test's own
// failure; the rollback shows as a teardown frame after it, and the failure
// bundle holds the page the test broke on, not the rolled-back one.

function test_teardown_runs_after_a_failure() {
  step("Turn the stand on — and fail doing it", () => {
    goto('/');
    waitForText('Stress-test browser');
    teardown("Turn the stand off", () => {
      setLocalStorage('dogfood-teardown-flag', 'off');
      log('stand off after the failure');
    });
    setLocalStorage('dogfood-teardown-flag', 'on');
    assertTrue(getLocalStorage('dogfood-teardown-flag') == 'never', 'turning the stand on failed');
  });
}
