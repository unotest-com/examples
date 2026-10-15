// Idiom: wait for an animation to end.
// Habit: pause(600) "until the dialog has faded in", then read or shoot it.
// Typed step: waitForAnimations(locator) returns the moment nothing in the
// element is moving; a static element returns at once.

function test_idiom_wait_for_animations() {
  step("Open a dialog that fades in", () => {
    goto('/scenarios/big-table?rows=20&groups=0&markers=0&shadow=none&hidden=0&seed=42');
    click(getByRole('row', {name: /^Row R-00002:/}).getByRole('button', {name: 'Edit'}));
  });

  step("Wait for the fade, not for a guessed number of milliseconds", () => {
    waitForAnimations(getByRole('dialog'));
    assertEqual(computedStyle(getByRole('dialog'), 'opacity'), '1');
  });
}
