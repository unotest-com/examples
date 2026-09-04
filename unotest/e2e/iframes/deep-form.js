// Nested iframes: three srcdoc levels with the same "Submit" button on
// every level (decoy on the top page too). Walk down with enterFrame,
// act in the deepest document, and come back out.
//
// Two ways down: the stateful enterFrame stack, then contentFrame() chaining
// — an <iframe> element turned into its document, so a single locator can
// cross a boundary without leaving a scope behind.

function test_nested_iframes() {
  step("Descend with enterFrame and act in the deepest frame", () => {
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
  });

  step("Chain contentFrame to the same nodes", () => {
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
  });
}
