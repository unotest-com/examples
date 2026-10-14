// @expect-fail
// Under step-coverage (#440): a return directly in test_* is not a step.
// The pair of language/return-in-test.js, where return ends a step.
// Lint refuses it. A run that skips lint does return there: the failing
// step never runs, the test passes, and the marker turns that pass red.
// Run by scripts/dogfood-expect-fail.mjs.

function test_return_in_test_body() {
  step("Read the feature flag off the page", () => {
    goto("data:text/html,<p data-testid='flag'>off</p>");
  });
  if (getInnerText(getByTestId('flag')) === 'off') {
    return;
  }
  step("Use the feature the flag turns on", () => {
    assertText(getByTestId('flag'), 'on');
  });
}
