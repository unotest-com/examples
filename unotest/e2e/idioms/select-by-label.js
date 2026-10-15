// Idiom: pick an option by the text the user sees.
// Habit: evaluate a loop over select.options to find the value of a text,
// then selectOption(select, thatValue).
// Typed step: selectOption(locator, {label}) picks by the visible text.

function select_page_url() {
  return 'data:text/html,<label>Country <select>' +
    '<option value="de">Germany</option><option value="fr">France</option>' +
    '</select></label>';
}

function test_idiom_select_by_label() {
  step("Open a page with a country select", () => {
    goto(select_page_url());
    waitFor(getByLabel('Country'));
  });

  step("Pick France by its label", () => {
    selectOption(getByLabel('Country'), {label: 'France'});
    assertValue(getByLabel('Country'), 'fr');
  });
}
