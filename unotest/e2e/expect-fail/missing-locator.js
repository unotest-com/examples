// @expect-fail
// Deliberate failure: nothing on the page matches. Run by
// scripts/dogfood-expect-fail.mjs, which asserts the wording of the
// failure and the artifacts left behind — never green.

function test_missing_locator_fails_with_evidence() {
  step("Open the hub", () => {
    goto('/');
    waitForText('Stress-test browser');
  });

  step("Click a button that does not exist", () => {
    click(getByRole('button', {name: 'Definitely Not On This Page'}), {timeout: 1500});
  });
}
