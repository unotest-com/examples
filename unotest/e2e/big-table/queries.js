// Read-side of the DSL against a seeded table: counting, reading text and
// attributes, refining a locator (filter / first / last / nth), and the
// enabled-state of toolbar buttons. Small deterministic slice — the strict-
// mode trap itself is big-table/edit-dialog.
//
// The table deliberately ships display:none rows: they stay in the DOM but
// leave the accessibility tree, which is exactly the difference a CSS
// locator and a role locator must report.

function test_counting_and_reading() {
  step("Open a small seeded table", () => {
    goto('/scenarios/big-table?rows=60&groups=0&markers=0&shadow=none&hidden=5&seed=42');
    waitFor(getByRole('row', {name: /^Row R-00001:/}));
  });

  step("count() and assertCount agree", () => {
    visibleRows = count(getByRole('row'));
    assertTrue(visibleRows > 1, 'the table should expose a header row plus data rows');
    assertCount(getByRole('row'), visibleRows);
  });

  step("display:none rows stay in the DOM but leave the a11y tree", () => {
    domRows = count(locator('tbody tr'));
    assertTrue(domRows > visibleRows, 'hidden rows should be invisible to role locators');
  });

  step("Text can be read back both raw and rendered", () => {
    firstRow = filter(getByRole('row'), {hasText: 'R-00001'});
    raw = textContent(firstRow);
    rendered = getInnerText(firstRow);
    assertTrue(textContains(raw, 'R-00001'), raw);
    assertTrue(textContains(rendered, 'R-00001'), rendered);
  });

  step("Rows carry avatar images with alt text", () => {
    assertTrue(count(getByAltText('avatar of', {exact: false})) > 1, 'every row should ship an avatar');
    assertVisible(first(getByAltText('avatar of', {exact: false})));
  });

  step("Attributes: value vs presence", () => {
    qty = getByLabel('Quantity for R-00001');
    assertTrue(getAttribute(qty, 'type') == 'number', getAttribute(qty, 'type'));
    assertTrue(hasAttribute(qty, 'aria-label'), 'the quantity input should carry an aria-label');
    assertTrue(isVisible(qty), 'the first quantity input should be on screen');
  });
}

function test_refining_and_selection_state() {
  step("Open a small seeded table", () => {
    goto('/scenarios/big-table?rows=60&groups=0&markers=0&shadow=none&hidden=5&seed=42');
    waitFor(getByRole('row', {name: /^Row R-00001:/}));
  });

  step("first / last / nth pick out single matches among clones", () => {
    editButtons = getByRole('button', {name: 'Edit'});
    assertTrue(count(editButtons) > 3, 'the table should be full of Edit clones');
    assertVisible(first(editButtons));
    assertVisible(nth(editButtons, 2));
    scrollIntoView(last(editButtons));
    assertVisible(last(editButtons));
  });

  step("Toolbar actions are disabled until something is selected", () => {
    assertTrue(isDisabled(getByRole('button', {name: 'Delete'})), 'Delete should start disabled');
    check(getByLabel('Select row R-00002'));
    assertTrue(isEnabled(getByRole('button', {name: 'Delete'})), 'selecting a row should enable Delete');
    assertValue(getByLabel('Select row R-00002'), 'true');
  });

  step("Unchecking takes the toolbar back", () => {
    uncheck(getByLabel('Select row R-00002'));
    assertValue(getByLabel('Select row R-00002'), 'false');
    assertTrue(isDisabled(getByRole('button', {name: 'Export'})), 'Export should be disabled again');
  });

  step("The filter box narrows the table down", () => {
    fill(getByPlaceholder('Filter by name'), 'R-00003');
    assertTrue(inputValue(getByPlaceholder('Filter by name')) == 'R-00003', 'filter text did not stick');
    waitFor(getByRole('button', {name: 'Clear filter'}));
    click(getByRole('button', {name: 'Clear filter'}));
    assertTrue(getInputValue(getByPlaceholder('Filter by name')) == '', 'the filter should be empty again');
  });
}
