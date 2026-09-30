// Control for support-write-closed: after a reset the same message goes
// into the open thread, so "This ticket is closed" there is not a page
// that always says so.

function test_support_write_open() {
  step("Client writes into the open thread", () => {
    flow_login(LOGIN, PASSWORD);
    goto('/support/thread/42');
    assertText(getByTestId('status'), 'Open');
    fill(getByRole('textbox', {name: 'Message'}), 'hello');
    press(getByRole('textbox', {name: 'Message'}), 'Enter');
    assertVisible(getByText(/: hello$/));
    assertHidden(getByText('This ticket is closed'));
  });
}
