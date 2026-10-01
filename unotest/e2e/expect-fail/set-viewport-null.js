// @expect-fail
// Deliberate failure, the control of viewport/real-window (#305): an open
// page cannot go back to the real window, so setViewport(null) is refused
// with the way out — viewport: null in the config — not applied silently.

function test_set_viewport_null_is_refused() {
  step("Open the home page", () => {
    goto('/');
    waitForText('Stress-test browser');
  });

  step("Ask the open page for the real window", () => {
    setViewport(null);
  });
}
