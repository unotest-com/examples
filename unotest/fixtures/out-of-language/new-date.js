// @expect-fail
// Out of the scenario language (#440, plan §6): the pair of language/library.js.
// Lint refuses it with validator:out-of-language and a hint; a run that
// skips lint errors on the same node. Run by scripts/dogfood-expect-fail.mjs.

function test_date_is_out_of_language() {
  step("Open a page", () => {
    goto("data:text/html,<p>x</p>");
  });
  step("Read the clock with new Date", () => {
    const now = new Date();
    note('now', now);
  });
}
