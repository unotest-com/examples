// clipboardRead / assertClipboard (#321): what a "copy" button left in the
// clipboard, read instead of intercepting navigator.clipboard.writeText.
// The playground has no copy button, so a mocked page on its origin (https,
// where the clipboard API exists) carries one; the click is a real one.

function test_copy_button_fills_the_clipboard() {
  step("Open a page with a copy button", () => {
    mockRoute('**/clipboard-fixture', {
      contentType: 'text/html',
      body: '<input id="link" value="https://app.test/invite/42" readonly>' +
        '<button onclick="setTimeout(() => navigator.clipboard.writeText(document.getElementById(\'link\').value), 300)">Copy link</button>',
    });
    goto('/clipboard-fixture');
  });

  step("The copied link lands in the clipboard a beat after the click", () => {
    click(getByRole('button', {name: 'Copy link'}));
    assertClipboard('https://app.test/invite/42', {timeoutMs: 5000});
  });

  step("clipboardRead hands the same text back to the scenario", () => {
    const copied = clipboardRead();
    assertTrue(textContains(copied, '/invite/42'), copied);
    assertClipboard(/\/invite\/\d+$/);
  });
}
