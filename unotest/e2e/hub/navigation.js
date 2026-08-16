// Browser history and page identity: back / forward / reload keep the SPA
// on the route the test expects, and getTitle / getUrl report the live page
// rather than the one we asked for.

function test_history_back_and_forward() {
  step("Open the hub", () => {
    goto('/');
    waitForText('Stress-test browser');
    assertTrue(textContains(getTitle(), 'unotest'), getTitle());
  });

  step("Move to a scenario page", () => {
    goto('/scenarios/clicks');
    assertUrl('/scenarios/clicks');
    waitFor(getByRole('button', {name: 'Click me', exact: true}));
  });

  step("Back lands on the hub again", () => {
    goBack();
    waitForText('Stress-test browser');
    assertTrue(textContains(getUrl(), 'playground') || textContains(getUrl(), 'localhost'), getUrl());
    assertTrue(textContains(getUrl(), '/scenarios/clicks') == false, getUrl());
  });

  step("Forward returns to the scenario page", () => {
    goForward();
    assertUrl('/scenarios/clicks');
    assertVisible(getByRole('button', {name: 'Click me', exact: true}));
  });

  step("Reload keeps the route and rebuilds the page", () => {
    reload();
    assertUrl('/scenarios/clicks');
    assertVisible(getByRole('button', {name: 'Double-click me'}));
  });
}
