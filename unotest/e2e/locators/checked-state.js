// A switch read and set by its checked state (isChecked, check, uncheck),
// and a CSS locator narrowed by its options — the same keys filter() reads.

function test_checked_state_and_locator_options() {
  let sw;
  let was;
  let all;
  let one;
  let same;
  step("Sign in and open the notification settings", () => {
    flow_signin();
    goto('/dashboard/settings');
    click(getByRole('tab', {name: 'notifications'}));
    waitFor(getByRole('switch', {name: 'Email notifications'}));
  });

  step("check and uncheck land in the state they name, either way round", () => {
    sw = getByRole('switch', {name: 'Email notifications'});
    was = isChecked(sw);
    if (was) {
      uncheck(sw);
      assertTrue(isChecked(sw) === false, 'uncheck should leave the switch off');
      check(sw);
    } else {
      check(sw);
      assertTrue(isChecked(sw) === true, 'check should leave the switch on');
      uncheck(sw);
    }
    assertTrue(isChecked(sw) === was, 'the switch should be back where it started');
  });

  step("check on a switch already on clicks nothing", () => {
    sw = getByRole('switch', {name: 'Email notifications'});
    check(sw);
    check(sw);
    assertTrue(isChecked(sw) === true, 'a second check should keep it on');
  });

  step("locator(css, {hasText}) narrows like filter()", () => {
    all = count(locator('[role="tab"]'));
    one = count(locator('[role="tab"]', {hasText: 'notifications'}));
    same = count(locator('[role="tab"]').filter({hasText: 'notifications'}));
    assertTrue(all > 1, 'the settings page should have several tabs, got ' + all);
    assertTrue(one === 1, 'hasText should keep one tab, got ' + one);
    assertTrue(one === same, 'locator options and filter() should agree');
  });
}
