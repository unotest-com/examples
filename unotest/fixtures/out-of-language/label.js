// @expect-fail
// Out of the scenario language (#440, plan §6): the pair of language/control-flow.js.
// Lint refuses it with validator:out-of-language and a hint; a run that
// skips lint errors on the same node. Run by scripts/dogfood-expect-fail.mjs.

function test_label_is_out_of_language() {
  step("Open a page", () => {
    goto("data:text/html,<p>x</p>");
  });
  step("Break out of a labelled loop", () => {
    outer: for (const a of [1, 2]) {
      for (const b of [1, 2]) {
        if (b === 2) break outer;
      }
    }
    note('loop', 'done');
  });
}
