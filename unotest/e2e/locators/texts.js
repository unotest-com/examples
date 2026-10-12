// The text of every match as a list: what assertTexts checks, as a value
// to branch on. Nothing matching is an empty list, not a wait.

function test_texts_of_every_match() {
  step("Sign in and open settings", () => {
    flow_signin();
    goto('/dashboard/settings');
    waitFor(getByRole('tab', {name: 'profile'}));
  });

  step("texts lists every tab, in page order", () => {
    tabs = texts(locator('[role="tab"]'));
    assertTrue(tabs.length === count(locator('[role="tab"]')), 'one text per tab: ' + json(tabs));
    assertTrue(tabs[0] === 'Profile', 'the first tab is Profile: ' + json(tabs));
  });

  step("No match is an empty list", () => {
    none = texts(locator('[role="tab"][data-unotest-absent]'));
    assertTrue(none.length === 0, json(none));
  });
}
