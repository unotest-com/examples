// The worked example of the docs guide "Port a @playwright/test spec": a
// spec with a describe, a beforeEach and four tests becomes one test_*
// whose four checks are soft steps — each keeps its own verdict, and one
// failing does not stop the others. Keep it in step with the guide.

function test_users_table() {
  // beforeEach: what every test needed. Signing in once is enough — the
  // session holds — and each check below opens the page it starts from.
  step("Sign in", () => {
    flow_signin();
  });

  step.soft("Prev is disabled on the first page", () => {
    goto('/dashboard/users');
    assertTrue(isDisabled(getByRole('button', {name: 'Prev'})), 'Prev should be disabled on page 1');
  });

  step.soft("Next moves to the second page", () => {
    goto('/dashboard/users');
    click(getByRole('button', {name: 'Next'}));
    assertText(getByText('Page 2 of', {exact: false}), 'Page 2 of', {exact: false});
  });

  step.soft("Sorting by name reorders the rows", () => {
    goto('/dashboard/users');
    before = textContent(nth(getByRole('row'), 1));
    click(getByRole('button', {name: 'name', exact: true}));
    assertTrue(textContent(nth(getByRole('row'), 1)) != before, 'the first row should change');
  });

  step.soft("New user opens the form", () => {
    goto('/dashboard/users');
    click(getByRole('button', {name: 'New user'}));
    assertVisible(getByLabel('Email'));
  });
}
