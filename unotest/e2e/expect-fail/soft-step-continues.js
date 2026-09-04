// @expect-fail
// Deliberate failure: two of three soft steps fail, the run keeps going,
// the untagged step after them still executes, and the verdict is red
// with every failed tag listed — q2 (the green one) must NOT be blamed.
// q2 moves to another page on purpose: the failure bundle must hold the
// page of the FIRST soft failure (clicks), not the one of the last.

function test_soft_failures_continue_and_are_listed() {
  step("Open the clicks scenario", () => {
    goto('/scenarios/clicks');
    waitFor(getByRole('button', {name: 'Click me', exact: true}));
  });

  step.soft("Question", {tag: 'q1'}, () => {
    assertText(getByRole('button', {name: 'Click me', exact: true}), 'Wrong label one', {timeout: 1000});
  });

  step.soft("Question", {tag: 'q2'}, () => {
    goto('/scenarios/drag-drop');
    waitFor(getByRole('region', {name: 'Column: Backlog'}));
  });

  step.soft("Question", {tag: 'q3'}, () => {
    assertText(getByRole('button', {name: 'Reset board', exact: true}), 'Wrong label three', {timeout: 1000});
  });

  step("Reached after soft failures", () => {
    log('Reached after soft failures');
    assertVisible(getByRole('region', {name: 'Column: Backlog'}));
  });
}
