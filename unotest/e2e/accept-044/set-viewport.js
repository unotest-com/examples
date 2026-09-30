// Acceptance 0.44, #211 criterion 2: setViewport on the live page, and the
// next screenshot comes out in the new size. The harness reads the PNG.

function test_set_viewport() {
  step("Open a page in the default window", () => {
    goto('/');
    screenshot('before');
  });

  step("Resize to 420x900 and capture", () => {
    setViewport({width: 420, height: 900});
    screenshot('after');
  });
}
