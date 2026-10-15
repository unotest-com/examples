// animations(locator) — the typed read of what is moving and how, instead
// of getAnimations() through evaluateOnLocator. An inline page (a data:
// URL) holds the three cases hasAnimation tells apart: a finite fade that
// counts, an infinite spinner and a paused one that are listed, not counted.

function motion_page_url() {
  return 'data:text/html,<style>' +
    '@keyframes fade { from { opacity: 0 } to { opacity: 1 } }' +
    '@keyframes spin { to { transform: rotate(360deg) } }' +
    '[data-testid=card] { animation: fade 30s linear }' +
    '[data-testid=spinner] { animation: spin 1s linear infinite }' +
    '[data-testid=held] { animation: fade 30s linear paused }' +
    '</style>' +
    '<div data-testid="card">card</div><div data-testid="spinner">spinner</div>' +
    '<div data-testid="held">held</div><div data-testid="still">still</div>';
}

function test_animations_lists_and_marks() {
  step("Open a page with a fade, a spinner and a paused animation", () => {
    goto(motion_page_url());
    waitFor(getByTestId('still'));
  });

  step("A finite fade is listed running, and hasAnimation counts it", () => {
    let list = animations(getByTestId('card'));
    assertTrue(list.length == 1 && list[0].name == 'fade' && list[0].kind == 'animation', json(list));
    assertTrue(list[0].playState == 'running' && list[0].infinite === false, json(list));
    assertTrue(typeof list[0].currentTime == 'number', json(list));
    assertTrue(hasAnimation(getByTestId('card')), 'hasAnimation should count the fade');
  });

  step("The spinner and the paused one are listed and marked, not counted", () => {
    let spinner = animations(getByTestId('spinner'));
    assertTrue(spinner.length == 1 && spinner[0].name == 'spin' && spinner[0].infinite === true, json(spinner));
    assertTrue(hasAnimation(getByTestId('spinner')) === false, 'an infinite animation should not count');
    let held = animations(getByTestId('held'));
    assertTrue(held.length == 1 && held[0].playState == 'paused', json(held));
    assertTrue(hasAnimation(getByTestId('held')) === false, 'a paused animation should not count');
  });

  step("A static element has none", () => {
    assertEqual(animations(getByTestId('still')), []);
  });
}
