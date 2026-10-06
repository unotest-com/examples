// A live-only check the dogfood stand has no live target for: the test
// skips itself by env and the run reads as skipped, not passed. Its twin,
// skip/runs-when-set, takes the other branch on a variable that is set.

function test_skip_when_the_live_target_is_unset() {
  step("Open the hub", () => {
    goto('/');
    waitForText('Stress-test browser');
  });

  skip(
    'UNOTEST_DOGFOOD_LIVE_TARGET is not set: no live target to check',
    env('UNOTEST_DOGFOOD_LIVE_TARGET') == null,
  );

  step("Never reached on the dogfood stand", () => {
    goto(env('UNOTEST_DOGFOOD_LIVE_TARGET'));
    assertTrue(false, 'the skip above should have ended the test');
  });
}
