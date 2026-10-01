// viewport: null — the page is as wide as the browser window, not an
// emulated 1280. The window is 1000×700 (--window-size in the config
// block this collection runs under).

function test_page_is_as_wide_as_the_window() {
  step("Open a page on the real window", () => {
    goto('/');
    waitForText('Stress-test browser');
  });

  step("innerWidth is the window's width", () => {
    width = evaluate('(() => window.innerWidth)()'); // lint-ok: the window's own width is what no typed getter reads
    assertTrue(width === 1000, json(width));
  });
}
