// Three tests in one file (#363), each its own run and verdict: one
// passes, one fails on purpose, one skips with a reason. The red one is
// marked by the comment touching it, so it alone is expected to fail —
// and it is not the first, so a marker leaking onto the file would show.
// Its neighbours write notes too: a failure reports only its own test's.

function test_hub_opens() {
  step("Open the hub", () => {
    goto('/');
    waitForText('Stress-test browser');
    note('green neighbour', 'note-of-the-first-test');
  });
}

// The button's label is not what this test claims: red on purpose.
// @expect-fail
function test_claims_a_wrong_label() {
  step("Open the clicks scenario", () => {
    goto('/scenarios/clicks');
    waitFor(getByRole('button', {name: 'Click me', exact: true}));
  });

  step("Assert a label the button does not have", () => {
    note('claimed label', 'the-label-test-two-claims');
    assertText(getByRole('button', {name: 'Click me', exact: true}), 'Not The Label', {timeout: 1500});
  });
}

function test_skips_without_a_live_target() {
  step("Open the hub", () => {
    goto('/');
    waitForText('Stress-test browser');
    note('skipped neighbour', 'note-of-the-third-test');
  });

  skip(
    'UNOTEST_DOGFOOD_LIVE_TARGET is not set: no live target to check',
    env('UNOTEST_DOGFOOD_LIVE_TARGET') == null,
  );

  step("Never reached on the dogfood stand", () => {
    goto(env('UNOTEST_DOGFOOD_LIVE_TARGET'));
    assertTrue(false, 'the skip above should have ended the test');
  });
}
