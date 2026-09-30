// Fixture for #197 criterion 1, second client: a separate browser signs
// in and writes into ticket 42 closed by support-close. Seeing the
// closure proves the thread state lives on the server, not in a context.

function test_support_write_closed() {
  step("Client B writes into the closed thread", () => {
    flow_login(LOGIN, PASSWORD);
    goto('/support/thread/42');
    fill(getByRole('textbox', {name: 'Message'}), 'hello');
    press(getByRole('textbox', {name: 'Message'}), 'Enter');
    assertVisible(getByText('This ticket is closed'));
  });
}
