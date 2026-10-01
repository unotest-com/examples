// Two tabs, the steps on one, the other in front: setPage {activate: false}
// moves only the steps, bringToFront shows a tab without moving them. Which
// tab the browser shows is not readable from a page (Playwright keeps every
// tab "visible"); here the calls run and the steps stay where they should.

function test_bring_to_front_keeps_the_steps_in_place() {
  step("Open the clicks scenario and a second tab", () => {
    goto('/scenarios/clicks');
    waitFor(getByRole('button', {name: 'Open popup'}));
    evaluate("() => { window.open('/scenarios/drag-drop', '_blank'); }"); // lint-ok: a script-opened tab is the subject, no control on the page opens one with a URL
    waitForPage();
    assertUrl('/scenarios/drag-drop');
  });

  step("setPage without activation: the steps move to tab 0", () => {
    setPage(0, {activate: false});
    assertUrl('/scenarios/clicks');
  });

  step("bringToFront(1) shows tab 1, the steps stay on tab 0", () => {
    bringToFront(1);
    assertUrl('/scenarios/clicks');
    bringToFront();
    assertVisible(getByRole('button', {name: 'Open popup'}));
  });

  step("setPage(1, {activate: false}) reaches tab 1", () => {
    setPage(1, {activate: false});
    assertUrl('/scenarios/drag-drop');
  });
}
