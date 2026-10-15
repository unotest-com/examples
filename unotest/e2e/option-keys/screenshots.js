// The fullPage option of screenshot and assertScreenshot (#526) on a page
// 2400 px tall. screenshot: the PNG's height, read from its header
// (readFileInfo), is the window's without the key and the page's with it.
// assertScreenshot: the baseline is the full page; the same check without
// fullPage takes the window only and fails on the size.
// Inline page (a data: URL, so no `#` in it: that starts the fragment).

function tall_page_url() {
  return 'data:text/html,<style>body{margin:0}div{height:2400px;background:linear-gradient(red,blue)}</style><div></div>';
}

function test_screenshot_full_page() {
  step("Open the tall page", () => {
    goto(tall_page_url());
  });

  step("screenshot: the window without the key, the whole page with {fullPage: true}", () => {
    const window_shot = readFileInfo(screenshot('window'));
    assertTrue(window_shot.png.height < 2400, json(window_shot));
    const page_shot = readFileInfo(screenshot('page', {fullPage: true}));
    assertEqual(page_shot.png.height, 2400);
  });

  step("assertScreenshot {fullPage: true} matches the full-page baseline; without it the size differs", () => {
    assertScreenshot('tall', {fullPage: true});
    const message = caught_message(() => assertScreenshot('tall'));
    assertTrue(textContains(message, 'the baseline 1280×2400'), message);
  });
}
