// @expect-fail
// Deliberate failure: an ambiguous locator. Strict mode is a feature — the
// message has to name the collision instead of silently picking the first.

function test_ambiguous_locator_is_rejected() {
  step("Open a seeded table full of clones", () => {
    goto('/scenarios/big-table?rows=30&groups=0&markers=0&shadow=none&hidden=0&seed=42');
    waitFor(getByRole('row', {name: /^Row R-00001:/}));
  });

  step("Click Edit without saying which one", () => {
    click(getByRole('button', {name: 'Edit'}), {timeout: 1500});
  });
}
