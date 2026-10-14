// @expect-fail
// Refused by lint (#440, plan §7): the pair of the template step of values/string-escapes.js.
// Lint refuses it with validator:evaluate-interpolation; the run does not
// refuse the node, so the harness checks lint only (the run gate is #345).
// Run by scripts/dogfood-expect-fail.mjs.

function test_evaluate_interpolation_is_refused() {
  step("Open a page", () => {
    goto("data:text/html,<p>x</p>");
  });
  step("Splice a value into page code", () => {
    const id = 'x';
    note('found', evaluate(`document.getElementById('${id}') !== null`));
  });
}
