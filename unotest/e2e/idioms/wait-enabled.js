// Idiom: wait until a button can be pressed.
// Habit: a for loop of pause(500) and isEnabled(button).
// Typed step: waitFor(locator, {state: 'enabled'}); aria-disabled and a
// disabled fieldset count, not only the disabled attribute.

function slow_form_url() {
  return 'data:text/html,<button disabled>Send</button>' +
    '<script>setTimeout(() => { document.querySelector("button").disabled = false; }, 800);</script>';
}

function test_idiom_wait_enabled() {
  step("Open a form whose button unlocks a moment later", () => {
    goto(slow_form_url());
    assertTrue(isDisabled(getByRole('button', {name: 'Send'})), 'Send starts disabled');
  });

  step("Wait for the state, then press", () => {
    waitFor(getByRole('button', {name: 'Send'}), {state: 'enabled'});
    click(getByRole('button', {name: 'Send'}));
  });
}
