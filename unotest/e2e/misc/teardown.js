// teardown(...) registers a rollback; it runs after the test body — passed,
// failed or stopped — newest first. One block lives in the test, one comes
// with flow_set_stand_flag (_helpers/stand.js). The journal shows both as
// teardown frames after the last step, in reverse order of registration.

function test_teardown_gives_the_stand_back() {
  step("Turn a stand flag on, with its rollback", () => {
    goto('/');
    waitForText('Stress-test browser');
    teardown("Clear the local marker", () => {
      setLocalStorage('dogfood-teardown-marker', '');
      log('marker cleared');
    });
    setLocalStorage('dogfood-teardown-marker', 'set');
    flow_set_stand_flag('dogfood-teardown-flag');
    assertTrue(getLocalStorage('dogfood-teardown-flag') == 'on', 'the flag was not turned on');
  });
}
