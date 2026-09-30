// Fixture for #197 criterion 1, first client: closes ticket 42. Runs
// against the fixture server (APP_BASE_URL=<fixtures>), after
// POST /support/reset.

function test_support_close_ticket() {
  step("Client A closes the open ticket", () => {
    flow_login(LOGIN, PASSWORD);
    goto('/support/thread/42');
    assertText(getByTestId('status'), 'Open');
    click(getByRole('button', {name: 'Close ticket'}));
    assertText(getByTestId('status'), 'Closed');
  });
}
