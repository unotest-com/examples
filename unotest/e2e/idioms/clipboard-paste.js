// Idiom: paste into a field.
// Habit: evaluate navigator.clipboard.writeText(...), then press('Meta+V'):
// needs clipboard permissions and differs per OS.
// Typed step: clipboardPaste(locator, text) puts the text in through the
// input path the page listens to. A rich editor that needs a real
// ClipboardEvent is out of its reach.

function paste_page_url() {
  return 'data:text/html,<label>Coupon <input></label><output></output>' +
    '<script>document.querySelector("input").addEventListener("input", (e) => {' +
    ' document.querySelector("output").textContent = "got " + e.target.value; });</script>';
}

function test_idiom_clipboard_paste() {
  step("Open a page that echoes its field", () => {
    goto(paste_page_url());
    waitFor(getByLabel('Coupon'));
  });

  step("Paste a code; the page sees the input event", () => {
    clipboardPaste(getByLabel('Coupon'), 'SPRING10');
    assertValue(getByLabel('Coupon'), 'SPRING10');
    waitForText('got SPRING10');
  });
}
