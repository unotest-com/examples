// Nested iframes: three srcdoc levels with the same "Submit" button on
// every level (decoy on the top page too). Walk down with enterFrame,
// act in the deepest document, and come back out.

function test_deep_frame_form_submit() {
  step("Open the nested-iframes scenario", () => {
    goto('/scenarios/iframes');
    waitFor(getByTitle('Level 1 frame'));
  });

  step("Descend to the deepest frame", () => {
    enterFrame(getByTitle('Level 1 frame'));
    enterFrame(getByTitle('Level 2 frame'));
    enterFrame(getByTitle('Level 3 frame'));
    waitForText('Target reached');
  });

  step("Fill the email inside the deepest frame", () => {
    // The deepest frame is sandboxed with allow-scripts but WITHOUT
    // allow-forms — submitting the form is silently blocked by the
    // browser (that's the trap). Type + read back, then use the
    // script-driven button as the observable action.
    fill(getByPlaceholder('you@example.com'), 'deep@unotest.com');
    assertValue(getByPlaceholder('you@example.com'), 'deep@unotest.com');
  });

  step("Click the deepest button, not its same-text decoys above", () => {
    click(getByRole('button', {name: 'The deepest button'}));
    waitForText('deepest button clicked');
  });

  step("Exit back to the top page", () => {
    exitFrame();
    exitFrame();
    exitFrame();
    assertVisible(getByTitle('Level 1 frame'));
  });
}

// The same frames reached by chaining instead of the stateful enterFrame
// stack: contentFrame() turns an <iframe> element into its document, so a
// single locator can cross a boundary without leaving a scope behind.
function test_content_frame_chain_reaches_the_same_nodes() {
  step("Open the nested-iframes scenario", () => {
    goto('/scenarios/iframes');
    waitFor(getByTitle('Level 1 frame'));
  });

  step("Chain down two levels in one locator", () => {
    level2 = getByTitle('Level 1 frame').contentFrame().getByTitle('Level 2 frame');
    assertVisible(level2);
    assertVisible(level2.contentFrame().getByTitle('Level 3 frame'));
  });

  step("The chained scope leaves no frame entered behind it", () => {
    assertVisible(getByTitle('Level 1 frame'));
  });
}
