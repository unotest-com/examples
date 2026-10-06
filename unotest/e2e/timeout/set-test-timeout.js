// setTestTimeout(ms): this test sets its own budget at the top of its body
// and finishes well inside it. Its twin, expect-fail/test-timeout-cut, runs
// out of a short one and must fail naming it.

function test_set_test_timeout_gives_this_test_its_budget() {
  setTestTimeout(60000);

  step("The hub loads inside the test's own budget", () => {
    goto('/');
    waitForText('Stress-test browser');
  });
}
