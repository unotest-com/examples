// One element read two ways the typed getters do not cover: where it lies
// (boundingBox) and raw JS on it (evaluateOnLocator), with the element
// first and the extra arguments after it.

function test_bounding_box_and_evaluate_on_locator() {
  step("Open a seeded table", () => {
    goto('/scenarios/big-table?rows=20&groups=0&markers=0&shadow=none&hidden=0&seed=42');
    waitFor(getByRole('row', {name: /^Row R-00001:/}));
  });

  step("A rendered row has a box with a size", () => {
    box = boundingBox(getByRole('row', {name: /^Row R-00001:/}));
    assertTrue(box.width > 0 && box.height > 0, json(box));
  });

  step("evaluateOnLocator hands the body the element, then the arguments", () => {
    row = getByRole('row', {name: /^Row R-00001:/});
    connected = evaluateOnLocator(row, '(el) => el.isConnected'); // lint-ok: the step exists to prove the escape hatch itself
    assertTrue(connected === true, json(connected));
    doubled = evaluateOnLocator(row, '(el, n) => n * 2', 21); // lint-ok: one argument arrives as itself
    assertTrue(doubled === 42, json(doubled));
    sum = evaluateOnLocator(row, '(el, [a, b]) => el.isConnected ? a + b : 0', 1, 2); // lint-ok: two or more arrive as one array
    assertTrue(sum === 3, json(sum));
  });

  step("An element that is not rendered has no box", () => {
    evaluateOnLocator(locator('body'), '(el) => { const d = document.createElement("div"); d.id = "unotest-hidden-probe"; d.style.display = "none"; el.appendChild(d); }'); // lint-ok: a hidden element the page does not have
    assertTrue(boundingBox(locator('#unotest-hidden-probe')) === null, 'a display:none element should have no box');
  });
}
