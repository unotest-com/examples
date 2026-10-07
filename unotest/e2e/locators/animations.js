// waitForAnimations / hasAnimation on the playground's edit dialog, which
// fades in (200 ms). After the wait the dialog is fully opaque and nothing
// is moving; a static row has no animation to begin with.

function test_wait_for_animations() {
  step("Open a seeded table", () => {
    goto('/scenarios/big-table?rows=20&groups=0&markers=0&shadow=none&hidden=0&seed=42');
    waitFor(getByRole('row', {name: /^Row R-00002:/}));
  });

  step("A static row has no animation", () => {
    assertTrue(hasAnimation(getByRole('row', {name: /^Row R-00001:/})) === false, 'a table row should not be animating');
  });

  step("The edit dialog has finished fading in after the wait", () => {
    click(getByRole('row', {name: /^Row R-00002:/}).getByRole('button', {name: 'Edit'}));
    waitForAnimations(getByRole('dialog'), {timeout: 3000});
    assertTrue(hasAnimation(getByRole('dialog')) === false, 'the dialog is still animating after the wait');
    opacity = computedStyle(getByRole('dialog'), 'opacity');
    assertTrue(opacity === '1', json(opacity));
  });
}
