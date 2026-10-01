// The scenario's own tabs: newPage opens one and the steps follow it,
// closePage closes it and the steps are back on the tab they left.

function test_new_page_and_close_page_return_to_the_tab_before() {
  step("Start on the clicks scenario", () => {
    goto('/scenarios/clicks');
    assertVisible(getByRole('button', {name: 'Open popup'}));
  });

  step("newPage(url) opens a second tab and the steps move to it", () => {
    tab = newPage('/scenarios/drag-drop');
    assertTrue(tab == 1, 'newPage returned ' + tab);
    assertUrl('/scenarios/drag-drop');
  });

  step("closePage() closes it: the steps are back on the first tab", () => {
    closePage();
    assertUrl('/scenarios/clicks');
    assertVisible(getByRole('button', {name: 'Open popup'}));
  });

  step("A blank newPage() and closePage(index) of a tab not active", () => {
    newPage();
    setPage(0);
    closePage(1);
    assertUrl('/scenarios/clicks');
  });
}
