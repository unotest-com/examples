// Four-step onboarding form. Next is gated per step, VAT only exists for
// non-sole-proprietors and the seats field only for the Team plan — so the
// interesting assertions are about what is disabled and what is not
// rendered at all yet.

function test_wizard_gates_each_step() {
  step("Sign in and open the wizard", () => {
    flow_signin();
    goto('/dashboard/wizard');
    waitFor(getByLabel('Full name'));
  });

  step("Next stays disabled until the account step validates", () => {
    assertTrue(isDisabled(getByRole('button', {name: 'Next'})), 'Next should start disabled');
    fill(getByLabel('Full name'), 'Dogfood Runner');
    fill(getByLabel('Work email'), 'not-an-email');
    assertTrue(isDisabled(getByRole('button', {name: 'Next'})), 'a malformed email must keep Next disabled');
    assertVisible(getByText('Invalid email'));
  });

  step("A valid email unlocks the step", () => {
    fill(getByLabel('Work email'), 'runner@dogfood.test');
    // The wait, not a probe: validation runs on input, so "enabled" is a
    // state to await rather than to snapshot.
    waitFor(getByRole('button', {name: 'Next'}), {state: 'enabled'});
    assertTrue(isEnabled(getByRole('button', {name: 'Next'})), 'Next should unlock once the step is valid');
    click(getByRole('button', {name: 'Next'}));
  });

  step("The company step demands a VAT number unless it is a sole prop", () => {
    fill(getByLabel('Company name'), 'Dogfood Ltd');
    assertTrue(isDisabled(getByRole('button', {name: 'Next'})), 'an LLC needs a VAT number');
    selectOption(getByLabel('Company type'), 'Sole proprietor');
    assertHidden(getByLabel('VAT number'));
    assertTrue(isEnabled(getByRole('button', {name: 'Next'})), 'a sole prop should pass without VAT');
    click(getByRole('button', {name: 'Next'}));
  });

  step("Seats only appear for the Team plan, and only 2+ pass", () => {
    assertHidden(getByLabel('Number of seats'));
    // The radio itself is sr-only and its own label covers it — force past
    // the interception rather than clicking the label by text.
    check(getByRole('radio', {name: 'Team'}), {force: true});
    fill(getByLabel('Number of seats'), '1');
    assertTrue(isDisabled(getByRole('button', {name: 'Next'})), 'one seat is below the Team minimum');
    fill(getByLabel('Number of seats'), '4');
    assertTrue(isEnabled(getByRole('button', {name: 'Next'})), 'four seats should be accepted');
    click(getByRole('button', {name: 'Next'}));
  });

  step("Back returns to the plan step with the values intact", () => {
    click(getByRole('button', {name: 'Back'}));
    assertValue(getByLabel('Number of seats'), '4');
    click(getByRole('button', {name: 'Next'}));
  });

  step("Submitting hands back a confirmation id", () => {
    click(getByRole('button', {name: 'Submit'}));
    waitForText('Submission received');
    assertText(getByText('Confirmation ID', {exact: false}), 'SUB-', {exact: false});
  });
}
