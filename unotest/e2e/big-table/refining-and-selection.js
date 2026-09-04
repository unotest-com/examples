// Refining a locator (filter / first / last / nth) against a seeded table,
// and the enabled-state of toolbar buttons that follows row selection.
// Reading and counting live in big-table/counting-and-reading.

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
