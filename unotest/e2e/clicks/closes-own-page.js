// An action whose own effect closes the page: the popup's Close button runs
// window.close(). Enter clicks the button on keydown, so the page is gone
// before the keyup; the held key keeps that gap wide every run. The action
// still did its work, so it passes, and the run goes on in the first page.
// The mouse side of the same race is guarded by the driver's browser test.

function test_an_action_that_closes_its_own_page_passes() {
  step("Open the popup", () => {
    goto('/scenarios/clicks');
    click(getByRole('button', {name: 'Open popup'}));
    setPage(1);
    waitForText('Popup opened via');
  });

  step("Enter on Close closes the popup and the action passes", () => {
    press(getByRole('button', {name: 'Close'}), 'Enter', {delay: 300});
    setPage(0);
    assertVisible(getByRole('button', {name: 'Open popup'}));
  });
}
