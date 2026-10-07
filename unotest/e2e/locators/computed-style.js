// computedStyle reads what the browser resolved for one element: a plain
// property and a custom one inherited from :root. Each is checked against
// getComputedStyle itself, and against a different property as a control.

function test_computed_style() {
  step("Open a seeded table", () => {
    goto('/scenarios/big-table?rows=20&groups=0&markers=0&shadow=none&hidden=0&seed=42');
    waitFor(getByRole('row', {name: /^Row R-00001:/}));
  });

  step("A plain property is the browser's own value", () => {
    row = getByRole('row', {name: /^Row R-00001:/});
    display = computedStyle(row, 'display');
    native = evaluateOnLocator(row, '(el) => getComputedStyle(el).getPropertyValue("display")'); // lint-ok: the browser's own answer to compare against
    assertTrue(display === native, json([display, native]));
    assertTrue(display === 'table-row', display);
    fontSize = computedStyle(row, 'font-size');
    assertTrue(fontSize !== display, json([fontSize, display]));
  });

  step("A custom property inherited from :root reads its value", () => {
    accent = computedStyle(locator('body'), '--accent');
    native = evaluateOnLocator(locator('body'), '(el) => getComputedStyle(el).getPropertyValue("--accent").trim()'); // lint-ok: the browser's own answer to compare against
    assertTrue(accent === native, json([accent, native]));
    assertTrue(textMatches(accent, /^142 71% \d+%$/), accent);
    fg = computedStyle(locator('body'), '--fg');
    assertTrue(fg !== accent, json([fg, accent]));
    assertTrue(computedStyle(locator('body'), '--no-such-property') === '', 'an unset property should read empty');
  });
}
