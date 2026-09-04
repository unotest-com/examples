// @expect-fail
// Deliberate failure: the judge rejects the page against a rubric that
// cannot match. The verdict — rubric, text and reason — must reach the
// output and the viewer's ErrorCard whole, not as a bare error message.
// Runs against the fake judge (UNOTEST_JUDGE_PROVIDER=fake in unotest/.env),
// so no network and no LLM are involved.

function test_judge_verdict_is_visible_when_it_fails() {
  step("Open the playground hub", () => {
    goto('/');
    waitForText('Stress-test browser');
  });

  step("Judge the hub intro against a rubric it cannot satisfy", () => {
    note('rubric', 'must contain: purple elephant');
    assertJudge(locator('h1'), 'must contain: purple elephant');
  });
}
