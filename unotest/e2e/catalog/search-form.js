// The legacy catalog's search form: huge native selects and a decorative
// submit that only answers with a status line.

function test_search_form_selects_and_submit() {
  step("Open the seeded catalog tree", () => {
    goto(textJoin(['/scenarios/catalog/tree?type=K&seed=', CATALOG_SEED, '&latency=', CATALOG_LATENCY_MS]));
    waitFor(getByLabel('Year'));
  });

  step("Pick options in the oversized native dropdowns", () => {
    selectOption(getByLabel('Year'), '2019');
    assertValue(getByLabel('Year'), '2019');
    selectOption(getByLabel('Go To'), 'Figures');
    assertValue(getByLabel('Go To'), 'Figures');
  });

  step("Enter in the search box submits the form", () => {
    fill(getByLabel('Find'), 'space rangers');
    press(getByLabel('Find'), 'Enter');
    assertText(getByRole('status'), 'Search is decorative', {exact: false});
  });
}
