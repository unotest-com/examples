// The escape hatch: evaluate() is the last resort for state the DOM does
// not expose — here the canvas cell, whose score never reaches the
// accessibility tree.

function test_evaluate_reads_what_the_dom_hides() {
  step("Open a seeded table with canvas cells", () => {
    goto('/scenarios/big-table?rows=20&groups=0&markers=0&shadow=none&hidden=0&seed=42');
    waitFor(getByRole('row', {name: /^Row R-00001:/}));
  });

  step("Canvas pixels are unreachable by locators but not by evaluate", () => {
    canvasCount = evaluate('(() => document.querySelectorAll("canvas").length)()'); // lint-ok: canvas pixels are exactly what no typed getter can read
    assertTrue(canvasCount > 0, 'the seeded table should render canvas cells');
  });

  step("Arguments reach the page context", () => {
    doubled = evaluate('function(n) { return n * 2; }', 21); // lint-ok: the step exists to prove the escape hatch itself
    assertTrue(doubled == 42, 'evaluate should pass its argument through');
  });
}
