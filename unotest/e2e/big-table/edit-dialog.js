// Big Table: the strict-mode trap — dozens of identical "Edit"
// buttons. Scope through the row's accessible name, then assert the
// edit dialog opened for THAT row. Seeded params keep data stable.

function test_edit_targets_the_right_row() {
  step("Open Big Table with seeded data", () => {
    goto('/scenarios/big-table?rows=300&groups=50&seed=42');
    waitFor(getByRole('row', {name: /^Row R-00001:/}));
  });

  step("Type into the first row's email cell and read it back", () => {
    fill(getByRole('textbox', {name: 'Email for R-00001'}), 'dogfood@unotest.com');
    assertValue(getByRole('textbox', {name: 'Email for R-00001'}), 'dogfood@unotest.com');
  });

  step("Edit on row R-00002 opens the dialog for R-00002, not a clone", () => {
    click(getByRole('row', {name: /^Row R-00002:/}).getByRole('button', {name: 'Edit'}));
    assertVisible(getByRole('dialog'));
    assertText(getByRole('dialog'), 'R-00002', {exact: false});
  });
}
