// Idiom: what is moving on this element?
// Habit: evaluateOnLocator(el, '(el) => el.getAnimations().map(…)').
// Typed step: animations(locator) lists each animation: name, kind,
// playState, infinite. hasAnimation(locator) is the yes/no.

function motion_page_url() {
  return 'data:text/html,<style>' +
    '@keyframes spin { to { transform: rotate(360deg) } }' +
    '[data-testid=spinner] { animation: spin 1s linear infinite }' +
    '</style><div data-testid="spinner">loading</div><div data-testid="still">still</div>';
}

function test_idiom_animations_list() {
  step("Open a page with a spinner", () => {
    goto(motion_page_url());
    waitFor(getByTestId('still'));
  });

  step("The spinner lists one infinite animation; the still block none", () => {
    let list = animations(getByTestId('spinner'));
    assertTrue(list.length == 1 && list[0].name == 'spin' && list[0].infinite === true, json(list));
    assertEqual(animations(getByTestId('still')), []);
  });
}
