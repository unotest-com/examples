// @expect-fail
// Out of the scenario language (#440, plan §6): the pair of language/library.js.
// Lint refuses the member; a run that skips lint reads undefined, so the
// test asserts the prototype is reachable and fails on purpose.
// Run by scripts/dogfood-expect-fail.mjs.

function test_constructor_is_not_reachable() {
  step("Open a page", () => {
    goto("data:text/html,<p>x</p>");
  });
  step("Reach the constructor of a string", () => {
    const s = 'abc';
    const row = { a: 1 };
    assertTrue(s.constructor !== undefined || row.constructor !== undefined, 'a prototype is reachable from a value');
  });
}
