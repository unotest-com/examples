// @expect-fail
// Deliberate failure: a soft step fails INSIDE an outer step. The outer
// step must finish (its remaining children run), the run must reach the
// step after it, and the parent must report its soft tally, not die.

function test_soft_failure_inside_an_outer_step() {
  step("Questions from the clicks page", () => {
    goto('/scenarios/clicks');
    waitFor(getByRole('button', {name: 'Click me', exact: true}));

    step.soft("Question", {tag: 'n1'}, () => {
      assertVisible(getByRole('button', {name: 'Click me', exact: true}));
    });

    step.soft("Question", {tag: 'n2'}, () => {
      assertText(getByRole('button', {name: 'Click me', exact: true}), 'Wrong nested label', {timeout: 1000});
    });

    step("Sibling after the soft failure", () => {
      assertVisible(getByRole('button', {name: 'Double-click me'}));
    });
  });

  step("Reached after the outer step", () => {
    log('Reached after the outer step');
    assertVisible(getByRole('button', {name: 'Open popup'}));
  });
}
