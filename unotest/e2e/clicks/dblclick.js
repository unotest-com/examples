// Click vs double-click. The mixed tile has BOTH handlers: a real double
// click fires click → click → dblclick, and the page debounces the
// single-click dialog by 280ms so the dblclick one wins — a synthetic "two
// clicks" would open the wrong dialog. The popup tiles are
// clicks/popup-set-page.

function test_double_click_wins_over_the_single_click_dialog() {
  step("Open the clicks scenario", () => {
    goto('/scenarios/clicks');
    waitFor(getByRole('button', {name: 'Double-click me'}));
  });

  step("A single click on the dblclick-only tile is ignored", () => {
    click(getByRole('button', {name: 'Double-click me'}));
    assertNeverAppears(getByRole('dialog', {name: 'Double-click dialog'}), {withinMs: 700});
  });

  step("A double click opens its dialog", () => {
    doubleClick(getByRole('button', {name: 'Double-click me'}));
    assertVisible(getByRole('dialog', {name: 'Double-click dialog'}));
    assertText(getByRole('dialog', {name: 'Double-click dialog'}), 'event.detail = 2', {exact: false});
    click(getByRole('button', {name: 'Close dialog'}));
  });

  step("On the mixed tile the double-click dialog beats the single one", () => {
    doubleClick(getByRole('button', {name: 'Either action'}));
    assertVisible(getByRole('dialog', {name: 'Mixed — double click'}));
    click(getByRole('button', {name: 'Close dialog'}));
  });
}
