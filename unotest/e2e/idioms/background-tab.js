// Idiom: work in one tab while another is in front.
// Habit: window.open through evaluate, then guessing the tab index.
// Typed steps: newPage(url) opens a tab and returns its index;
// setPage(i, {activate: false}) moves the steps without bringing the tab
// forward; bringToFront(i) shows a tab without moving the steps.

function test_idiom_background_tab() {
  step("The site in tab 0, a second page in a new tab", () => {
    goto('/scenarios/clicks');
    let second = newPage('/scenarios/drag-drop');
    assertEqual(second, 1);
    assertUrl('/scenarios/drag-drop');
  });

  step("Steps back on tab 0, tab 1 stays in front", () => {
    setPage(0, {activate: false});
    assertUrl('/scenarios/clicks');
  });

  step("Show tab 0 again; the steps do not move", () => {
    bringToFront(0);
    assertUrl('/scenarios/clicks');
  });
}
