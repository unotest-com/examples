// CRUD table behind the fake login: create through a modal, find the row
// again through search, delete it through a confirm dialog. Every user gets
// a run-scoped name — the table is full of deliberate duplicates ("Ava Tan"
// five times), so anything less specific picks the wrong row.

function test_create_find_and_delete_a_user() {
  step("Sign in and open the users table", () => {
    flow_signin();
    goto('/dashboard/users');
    waitFor(getByRole('button', {name: 'New user'}));
    name = 'Dogfood ' + randomWord(6);
    email = randomWord(8) + '@dogfood.test';
  });

  step("Create a user through the modal", () => {
    click(getByRole('button', {name: 'New user'}));
    waitForText('New user');
    fill(getByLabel('Name'), name);
    fill(getByLabel('Email'), email);
    selectOption(getByLabel('Role'), 'Editor');
    click(getByRole('button', {name: 'Create user'}));
  });

  step("Search narrows the table down to that row", () => {
    fill(getByLabel('Search users'), email);
    assertCount(getByRole('row').filter({hasText: email}), 1);
    assertVisible(getByRole('cell', {name: name, exact: true}));
  });

  step("Editing it through the row menu sticks", () => {
    click(getByRole('button', {name: 'Actions for ' + name}));
    click(getByRole('menuitem', {name: 'Edit'}));
    fill(getByLabel('Name'), name + ' Jr');
    click(getByRole('button', {name: 'Save changes'}));
    assertVisible(getByRole('cell', {name: name + ' Jr', exact: true}));
  });

  step("Deleting asks for confirmation first", () => {
    click(getByRole('button', {name: 'Actions for ' + name + ' Jr'}));
    click(getByRole('menuitem', {name: 'Delete'}));
    waitForText('Delete user');
    click(getByRole('button', {name: 'Cancel'}));
    assertVisible(getByRole('cell', {name: name + ' Jr', exact: true}));
  });

  step("Confirming removes the row", () => {
    click(getByRole('button', {name: 'Actions for ' + name + ' Jr'}));
    click(getByRole('menuitem', {name: 'Delete'}));
    click(getByRole('button', {name: 'Delete', exact: true}));
    assertHidden(getByRole('cell', {name: name + ' Jr', exact: true}));
  });
}

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
