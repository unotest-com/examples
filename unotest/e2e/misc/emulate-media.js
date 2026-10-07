// emulateMedia mid-scenario, seen the way the playground sees it:
// prefers-reduced-motion collapses its animations (index.css), and
// prefers-color-scheme picks the theme when a page loads (index.html)
// and is then stored, so the dark case runs in a fresh client.
// Each is read before the call as a control.

function test_emulate_media() {
  step("Light by default: the light accent", () => {
    emulateMedia({colorScheme: 'light'});
    goto('/scenarios/big-table?rows=20&groups=0&markers=0&shadow=none&hidden=0&seed=42');
    waitFor(getByRole('row', {name: /^Row R-00002:/}));
    assertTrue(textMatches(computedStyle(locator('body'), '--accent'), /^142 71% 38%$/), computedStyle(locator('body'), '--accent'));
  });

  step("Dark scheme: a fresh client loads with the dark accent", () => {
    // A fresh context: the playground stores the theme it picked on the
    // first load, and that, not the media, decides every load after it.
    newContext();
    emulateMedia({colorScheme: 'dark'});
    goto('/scenarios/big-table?rows=20&groups=0&markers=0&shadow=none&hidden=0&seed=42');
    waitFor(getByRole('row', {name: /^Row R-00002:/}));
    assertTrue(textMatches(computedStyle(locator('body'), '--accent'), /^142 71% 55%$/), computedStyle(locator('body'), '--accent'));
    setContext(0);
  });

  step("The edit dialog fades in for 200 ms by default", () => {
    click(getByRole('row', {name: /^Row R-00002:/}).getByRole('button', {name: 'Edit'}));
    assertTrue(computedStyle(getByRole('dialog'), 'animation-duration') === '0.2s', computedStyle(getByRole('dialog'), 'animation-duration'));
    press(getByRole('dialog'), 'Escape');
    waitFor(getByRole('dialog'), {state: 'hidden'});
  });

  step("Reduced motion: the same dialog does not animate", () => {
    emulateMedia({reducedMotion: 'reduce'});
    click(getByRole('row', {name: /^Row R-00002:/}).getByRole('button', {name: 'Edit'}));
    duration = computedStyle(getByRole('dialog'), 'animation-duration');
    assertTrue(duration !== '0.2s', json(duration));
    assertTrue(hasAnimation(getByRole('dialog')) === false, 'the dialog still animates under reduced motion');
  });
}
