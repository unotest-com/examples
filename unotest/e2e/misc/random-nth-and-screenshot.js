// randomNth() for flows where any clone will do, and screenshot() as the
// on-demand evidence tool writing into the run directory.

function test_random_nth_and_screenshot() {
  step("Open a seeded table", () => {
    goto('/scenarios/big-table?rows=30&groups=0&markers=0&shadow=none&hidden=0&seed=42');
    waitFor(getByRole('row', {name: /^Row R-00001:/}));
  });

  step("randomNth picks one of the clones without caring which", () => {
    assertVisible(randomNth(getByRole('button', {name: 'Edit'})));
  });

  step("screenshot writes evidence into the run directory", () => {
    shot = screenshot('big-table-rows');
    assertTrue(textContains(shot, 'big-table-rows'), shot);
    assertTrue(textContains(shot, '.png'), shot);
  });
}
