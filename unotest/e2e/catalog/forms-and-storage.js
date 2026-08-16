// The legacy catalog's search form (huge native selects, decorative
// submit), plus the two client-side stores a session lives in. The cookie
// overlay is gated on localStorage, so writing that key ahead of the visit
// is how a test skips the overlay instead of clicking it away every time.

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

function test_cookies_and_local_storage_survive_a_reload() {
  step("Open the catalog and write both stores", () => {
    goto(textJoin(['/scenarios/catalog?seed=', CATALOG_SEED]));
    setCookie('dogfood_probe', 'cookie-value');
    setLocalStorage('dogfood_probe', 'storage-value');
  });

  step("Both survive a reload", () => {
    reload();
    assertTrue(getCookie('dogfood_probe') == 'cookie-value', getCookie('dogfood_probe'));
    assertTrue(getLocalStorage('dogfood_probe') == 'storage-value', getLocalStorage('dogfood_probe'));
  });

  step("Pre-seeding the consent key keeps the cookie overlay away", () => {
    setLocalStorage('kitfinder_cookie_consent', 'ok');
    goto(textJoin(['/scenarios/catalog/tree?type=K&seed=', CATALOG_SEED, '&latency=', CATALOG_LATENCY_MS]));
    assertNeverAppears(getByRole('dialog', {name: 'Cookies'}), {withinMs: 1500});
  });
}

function test_delayed_navigation_is_waitable() {
  step("Open the tree with a visible navigation delay", () => {
    goto(textJoin(['/scenarios/catalog/tree?type=K&seed=', CATALOG_SEED, '&latency=1200']));
    setLocalStorage('kitfinder_cookie_consent', 'ok');
    reload();
    waitForText('Space Rangers');
  });

  step("waitForNavigation blocks until the delayed route lands", () => {
    click(getByRole('link', {name: 'Space Rangers Junior Cadets', exact: true}));
    waitForNavigation({timeout: 8000});
    assertUrl('catString=');
  });
}
