// @expect-fail
// Deliberate failure: the element is there, its text is not what we claim.
// The message must carry both sides plus the step label.

function test_assert_mismatch_reports_both_sides() {
  step("Open the clicks scenario", () => {
    goto('/scenarios/clicks');
    waitFor(getByRole('button', {name: 'Click me', exact: true}));
  });

  step("Assert the wrong label on a real button", () => {
    assertText(getByRole('button', {name: 'Click me', exact: true}), 'Totally Different Label', {timeout: 1500});
  });
}
