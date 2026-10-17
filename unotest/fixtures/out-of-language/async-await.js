// @expect-fail
// Refused by lint (#575): async and await in a scenario. On V8 an async
// step body returns at its first await, the check after it runs once the
// test is over, and the test passes with a check that does not hold.
// Lint refuses it with validator:async-await, lint --fix drops both
// words, and the run refuses the step body that returns a promise, so
// `e2e` stops before a test starts. Run by scripts/dogfood-expect-fail.mjs.

function test_async_await_is_refused() {
  step("Open a page", () => {
    goto("data:text/html,<p data-testid='flag'>off</p>");
  });
  step("Check the flag after an await", async () => {
    const flag = await getInnerText(getByTestId('flag'));
    assertEqual(flag, 'on');
  });
}
