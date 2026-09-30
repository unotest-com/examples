// A narrow screen mid-run: setViewport() resizes the open page without
// reloading it, and a window the page opens afterwards starts at the same
// size — the size belongs to the browser, not to one tab.

function test_set_viewport_resizes_without_reload() {
  step("Open the clicks scenario at the configured size", () => {
    goto('/scenarios/clicks');
    waitFor(getByRole('button', {name: 'Open popup'}));
    evaluate('() => { window.__sameDocument = true; }'); // lint-ok: a page-side marker is the only proof that the resize did not reload
  });

  step("Resize to a phone width", () => {
    setViewport({width: 420, height: 900});
    width = evaluate('() => window.innerWidth'); // lint-ok: the layout width is what setViewport changes and no locator reads it
    assertTrue(width == 420, 'innerWidth after setViewport: ' + width);
    assertTrue(evaluate('() => window.__sameDocument === true'), 'setViewport must not reload the page'); // lint-ok: see the marker above
    screenshot('narrow-420');
  });

  step("A window opened now starts at the new size", () => {
    click(getByRole('button', {name: 'Open popup'}));
    setPage(1);
    waitForText('Popup opened via');
    popupWidth = evaluate('() => window.innerWidth'); // lint-ok: same reading as above, in the second window
    assertTrue(popupWidth == 420, 'innerWidth of the popup: ' + popupWidth);
    click(getByRole('button', {name: 'Close'}));
    setPage(0);
  });
}
