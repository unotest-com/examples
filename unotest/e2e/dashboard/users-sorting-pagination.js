// The users table behind the fake login, read-only side: pagination
// buttons and sorting by column. Mutations live in dashboard/users-crud.

function test_sorting_and_pagination() {
  step("Sign in and open the users table", () => {
    flow_signin();
    goto('/dashboard/users');
    waitFor(getByRole('button', {name: 'New user'}));
  });

  step("Prev is disabled on the first page", () => {
    assertTrue(isDisabled(getByRole('button', {name: 'Prev'})), 'Prev should be disabled on page 1');
    assertText(getByText('Page 1 of', {exact: false}), 'Page 1 of', {exact: false});
  });

  step("Next moves to the second page", () => {
    click(getByRole('button', {name: 'Next'}));
    assertText(getByText('Page 2 of', {exact: false}), 'Page 2 of', {exact: false});
    assertTrue(isEnabled(getByRole('button', {name: 'Prev'})), 'Prev should be usable on page 2');
  });

  step("Sorting by name reorders the rows", () => {
    click(getByRole('button', {name: 'Prev'}));
    beforeSort = textContent(nth(getByRole('row'), 1));
    click(getByRole('button', {name: 'name', exact: true}));
    afterSort = textContent(nth(getByRole('row'), 1));
    assertTrue(beforeSort != afterSort, 'the first data row should change when sorting flips');
  });
}
