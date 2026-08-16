// Legacy Catalog: cookie overlay over the viewport bottom, substring-
// colliding link names, delayed navigation. CATALOG_SEED freezes the
// live counters; CATALOG_LATENCY_MS shrinks the deliberate delay.

function test_tree_navigates_through_the_traps() {
  step("Open the seeded catalog tree", () => {
    goto(textJoin([
      '/scenarios/catalog/tree?type=K&seed=', CATALOG_SEED,
      '&latency=', CATALOG_LATENCY_MS,
    ]));
    waitForText('Space Rangers');
  });

  step("Dismiss the cookie overlay before touching the lower viewport", () => {
    waitFor(getByRole('dialog', {name: 'Cookies'}));
    click(getByRole('button', {name: 'Okay'}));
    waitFor(getByRole('dialog', {name: 'Cookies'}), {state: 'hidden'});
  });

  step("Exact-name click wins over the substring collision", () => {
    // 'Space Rangers' x7 themes; exact matching pins the Junior Cadets
    // link instead of its shorter prefix sibling.
    click(getByRole('link', {name: 'Space Rangers Junior Cadets', exact: true}));
  });

  step("Delayed navigation lands on the list page for cat 65.1262", () => {
    waitForUrl('catString=65.1262');
    waitForText('Space Rangers Junior Cadets');
  });

  step("The page's own debug snapshot confirms the category", () => {
    // The only test id on the whole playground — the JSON block each
    // scenario page renders so a tool can verify the outcome it produced.
    assertText(getByTestId('debug-snapshot'), '65.1262', {exact: false});
  });
}
