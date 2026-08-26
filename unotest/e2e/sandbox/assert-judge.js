// assertJudge dogfood — runs against the deterministic fake provider
// (UNOTEST_JUDGE_MODE=local + JUDGE_PROVIDER=fake in unotest/.env), so the
// suite exercises the full judge pipeline (text capture → verdict →
// steps.jsonl record) without depending on a live LLM backend. The fake
// judge parses rubric lines "must contain: X" / "must not contain: X".

function test_judge_passes_semantic_rubric() {
  step("Open the playground hub", () => {
    goto('/');
    waitForText('Stress-test browser');
  });

  step("Judge the hub intro against a passing rubric", () => {
    assertJudge(locator('h1'), 'must contain: stress-test');
    assertJudge(locator('h1'), 'must not contain: purple elephant');
  });
}
