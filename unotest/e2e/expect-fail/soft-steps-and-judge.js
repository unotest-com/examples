// @expect-fail
// One failing scenario that leaves BOTH kinds of evidence a reader has to
// render: soft-step totals with tags, and a judge verdict.
//
// Soft steps do not stop a run — they are recorded and the run carries on,
// so the verdict at the end has to list every failed one, and only those.
// That is what the untagged step at the bottom proves: it still executes,
// and the green soft step must not be blamed alongside the red ones.
//
// Both judge verdicts are here on purpose, a passing one and a failing one:
// a report that shows only the failure hides the rubric that held.
//
// The judge is the deterministic fake provider (UNOTEST_JUDGE_MODE=local +
// UNOTEST_JUDGE_PROVIDER=fake), so nothing here depends on a live LLM.

function test_soft_steps_and_judge_verdict() {
  step("Open the playground hub", () => {
    goto('/');
    waitForText('Stress-test browser');
  });

  step.soft("Rubric", {tag: 'judge-green'}, () => {
    assertJudge(locator('h1'), 'must contain: stress-test');
  });

  step.soft("Rubric", {tag: 'judge-red'}, () => {
    note('rubric', 'must contain: purple elephant');
    assertJudge(locator('h1'), 'must contain: purple elephant');
  });

  step.soft("Label", {tag: 'link-red'}, () => {
    assertText(getByRole('link', {name: 'Big Table', exact: true}), 'Small Table', {timeout: 1000});
  });

  step("Reached after soft failures", () => {
    log('Reached after soft failures');
    assertVisible(getByRole('link', {name: 'Nested Iframes', exact: true}));
  });
}
