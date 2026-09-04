// The two client-side stores a catalog session lives in. The cookie
// overlay is gated on localStorage, so writing that key ahead of the visit
// is how a test skips the overlay instead of clicking it away every time.

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
