// Tabs, switches and dirty-state. Save and Discard are disabled until
// something actually changed, so the enabled-state of a button is the
// page's own record of "is there unsaved work" — and that is what the
// beforeunload guard keys off too.

function test_dirty_state_drives_save_and_discard() {
  step("Sign in and open settings", () => {
    flow_signin();
    goto('/dashboard/settings');
    waitFor(getByRole('tab', {name: 'profile'}));
  });

  step("Nothing is dirty on arrival", () => {
    assertTrue(isDisabled(getByRole('button', {name: 'Save changes'})), 'Save should start disabled');
    assertTrue(isDisabled(getByRole('button', {name: 'Discard'})), 'Discard should start disabled');
    assertHidden(getByText('unsaved changes'));
  });

  step("Editing the profile marks the form dirty", () => {
    original = getInputValue(getByLabel('Display name'));
    fill(getByLabel('Display name'), 'Dogfood ' + randomWord(5));
    assertVisible(getByText('unsaved changes'));
    assertTrue(isEnabled(getByRole('button', {name: 'Save changes'})), 'Save should unlock once dirty');
  });

  step("Discard rolls the edit back", () => {
    click(getByRole('button', {name: 'Discard'}));
    assertValue(getByLabel('Display name'), original);
    assertHidden(getByText('unsaved changes'));
  });

  step("Switching tabs keeps the section state", () => {
    click(getByRole('tab', {name: 'notifications'}));
    assertVisible(getByRole('switch', {name: 'Email notifications'}));
    click(getByRole('tab', {name: 'security'}));
    assertVisible(getByRole('switch', {name: 'Two-factor authentication'}));
  });

  step("Flipping a switch and saving raises the toast", () => {
    click(getByRole('switch', {name: 'Two-factor authentication'}));
    assertVisible(getByText('unsaved changes'));
    click(getByRole('button', {name: 'Save changes'}));
    waitForText('Settings saved');
    assertTrue(isDisabled(getByRole('button', {name: 'Save changes'})), 'saving should clear the dirty flag');
  });
}
