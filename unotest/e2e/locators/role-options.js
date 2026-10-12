// getByRole narrowed by ARIA state: {disabled} tells the locked Save button
// from the unlocked one, {checked} finds a switch by the state it is in.

function test_role_state_options() {
  step("Sign in and open the notification settings", () => {
    flow_signin();
    goto('/dashboard/settings');
    click(getByRole('tab', {name: 'notifications'}));
    waitFor(getByRole('switch', {name: 'Email notifications'}));
  });

  step("disabled: the clean form's Save is the disabled one", () => {
    locked = count(getByRole('button', {name: 'Save changes', disabled: true}));
    unlocked = count(getByRole('button', {name: 'Save changes', disabled: false}));
    assertTrue(locked === 1, 'Save should match {disabled: true} on a clean form, got ' + locked);
    assertTrue(unlocked === 0, 'Save should not match {disabled: false} on a clean form, got ' + unlocked);
  });

  step("checked: the switch matches the state it is in, not the other", () => {
    sw = getByRole('switch', {name: 'Email notifications'});
    was = isChecked(sw);
    same = count(getByRole('switch', {name: 'Email notifications', checked: was}));
    other = count(getByRole('switch', {name: 'Email notifications', checked: was === false}));
    assertTrue(same === 1, 'the switch should match {checked: ' + was + '}, got ' + same);
    assertTrue(other === 0, 'the switch should not match {checked: ' + (was === false) + '}, got ' + other);
  });

  step("disabled: flipping the switch unlocks Save, Discard locks it again", () => {
    click(getByRole('switch', {name: 'Email notifications'}));
    assertVisible(getByRole('button', {name: 'Save changes', disabled: false}));
    click(getByRole('button', {name: 'Discard'}));
    assertVisible(getByRole('button', {name: 'Save changes', disabled: true}));
  });
}
