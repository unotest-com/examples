// viewport: null — the page is as wide as the browser window, not the
// emulated size of the project. The `viewport` collection runs it with
// `viewport: null`; on its own it runs emulated and fails — the control.
//
// Emulation pins innerWidth, outerWidth and screen.width to the same
// emulated number, so only the number tells the two apart. 1280 is the
// project's viewport: unotest.config.mjs sets none and 1280×720 is the
// default; no DSL getter reads the config's size. The real window's own
// size is not asserted: headless Chromium opens 800×600, headed — the
// desktop's, and a collection has no window size to set.

function test_page_is_as_wide_as_the_window() {
  step("Open a page on the real window", () => {
    goto('/');
    waitForText('Stress-test browser');
  });

  step("innerWidth is not the emulated width", () => {
    sizes = evaluate('() => ({ inner: window.innerWidth, outer: window.outerWidth })'); // lint-ok: the window's own width is what no typed getter reads
    assertTrue(sizes.inner !== 1280, 'emulated, not the window: ' + json(sizes));
  });
}
