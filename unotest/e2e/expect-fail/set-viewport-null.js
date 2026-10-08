// @expect-fail
// Deliberate failure, the control of viewport/real-window (#305, #328):
// setViewport(null) reopens the browser on the real window only before the
// test does anything in it. After a navigation it is refused with that rule
// and the way out — viewport: null in the config — not applied silently.

function test_set_viewport_null_is_refused() {
  step("Open the home page", () => {
    goto('/');
    waitForText('Stress-test browser');
  });

  step("Ask the open page for the real window", () => {
    setViewport(null);
  });
}
