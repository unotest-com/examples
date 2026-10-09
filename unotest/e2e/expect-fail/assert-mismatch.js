// @expect-fail
// Deliberate failure: the element is there, its text is not what we claim.
// The message must carry both sides plus the step label, and the notes
// of the failing step (#376) — but not those of the green step before it.

function test_assert_mismatch_reports_both_sides() {
  step("Open the clicks scenario", () => {
    goto('/scenarios/clicks');
    waitFor(getByRole('button', {name: 'Click me', exact: true}));
    note('green step', 'opened-the-clicks-page');
  });

  step("Assert the wrong label on a real button", () => {
    note('claimed label', 'the-label-this-step-claims');
    assertText(getByRole('button', {name: 'Click me', exact: true}), 'Totally Different Label', {timeout: 1500});
  });
}
