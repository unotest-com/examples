// Tabs the page opens with window.open(), caught without knowing their
// index: waitForPage() hands each one over once and makes it active — also
// after an earlier tab closed and its index is free again.

function test_wait_for_page_catches_opened_tabs() {
  step("Open the clicks scenario", () => {
    goto('/scenarios/clicks');
    waitFor(getByRole('button', {name: 'Open popup'}));
  });

  step("The popup button opens a tab, waitForPage switches to it", () => {
    click(getByRole('button', {name: 'Open popup'}));
    popup = waitForPage();
    assertTrue(popup == 1, 'the popup is the second tab');
    waitForText('Popup opened via');
  });

  step("Close it from inside and come back to the first page", () => {
    click(getByRole('button', {name: 'Close'}));
    setPage(0);
    assertVisible(getByRole('button', {name: 'Open popup'}));
  });

  step("window.open with a URL, then waitForPage lands on that URL", () => {
    evaluate("() => { window.open('/scenarios/drag-drop', '_blank'); }"); // lint-ok: a script-opened tab is the subject, no control on the page opens one with a URL
    opened = waitForPage({timeoutMs: 10000});
    assertTrue(opened == 1, 'the freed index 1 goes to the new tab');
    assertUrl('/scenarios/drag-drop');
  });
}
