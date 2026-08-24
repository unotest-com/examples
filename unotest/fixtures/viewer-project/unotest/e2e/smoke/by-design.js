// @expect-fail
// Red on purpose: the marker is what the viewer's overview reads to tell
// "this test is broken" apart from "this test is doing its job". Its run
// is committed alongside the others, so the field always has one tile of
// every colour.

function test_missing_element_is_the_point() {
  step("Open a blank page", () => {
    goto('about:blank');
  });

  step("Wait for something that must never exist", () => {
    waitFor(getByRole('button', {name: 'Nothing here'}), {timeout: 1200});
  });
}
