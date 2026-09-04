// The second window: the popup tiles open a real browser window via
// window.open(), and setPage() has to reach it and come back.

function test_popup_window_is_reachable_with_set_page() {
  step("Open the clicks scenario", () => {
    goto('/scenarios/clicks');
    waitFor(getByRole('button', {name: 'Open popup'}));
    assertTrue(textContains(getTitle(), 'Click'), getTitle());
  });

  step("The popup opens as a second page", () => {
    click(getByRole('button', {name: 'Open popup'}));
    setPage(1);
    waitForText('Popup opened via');
    assertTrue(textContains(getTitle(), 'Popup (single click)'), getTitle());
  });

  step("Close it from inside and come back to the first page", () => {
    click(getByRole('button', {name: 'Close'}));
    setPage(0);
    assertVisible(getByRole('button', {name: 'Open popup'}));
  });
}
