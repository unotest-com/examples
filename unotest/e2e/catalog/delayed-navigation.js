// The catalog tree with a deliberately slow route: waitForNavigation has
// to block until the delayed navigation actually lands.

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
