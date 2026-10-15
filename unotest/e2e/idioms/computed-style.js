// Idiom: read a CSS value.
// Habit: evaluate("getComputedStyle(document.querySelector('.badge')).color").
// Typed step: computedStyle(locator, property) reads the resolved value
// off the element the locator finds, no page code.

function styled_page_url() {
  return 'data:text/html,<style>.badge { color: rgb(200, 0, 0); font-weight: 700 }</style>' +
    '<span class="badge">Overdue</span>';
}

function test_idiom_computed_style() {
  step("Open a page with a styled badge", () => {
    goto(styled_page_url());
    waitForText('Overdue');
  });

  step("Read the badge's colour and weight", () => {
    assertEqual(computedStyle(getByText('Overdue'), 'color'), 'rgb(200, 0, 0)');
    assertEqual(computedStyle(getByText('Overdue'), 'font-weight'), '700');
  });
}
