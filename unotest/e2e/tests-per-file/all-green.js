// Several tests in one file inside the gate (#363): each is its own run,
// and a skip with a reason is a verdict of its own, not a pass. Nothing
// here is red — the file with a red test lives in the expect-fail harness
// (tests-per-file/three-verdicts).

function test_hub_title() {
  step("Open the hub", () => {
    goto('/');
    waitForText('Stress-test browser');
  });
}

function test_skips_without_a_live_target() {
  skip(
    'UNOTEST_DOGFOOD_LIVE_TARGET is not set: no live target to check',
    env('UNOTEST_DOGFOOD_LIVE_TARGET') == null,
  );

  step("Never reached on the dogfood stand", () => {
    goto(env('UNOTEST_DOGFOOD_LIVE_TARGET'));
    assertTrue(false, 'the skip above should have ended the test');
  });
}

function test_clicks_page() {
  step("Open the clicks scenario", () => {
    goto('/scenarios/clicks');
    waitFor(getByRole('button', {name: 'Click me', exact: true}));
  });
}
