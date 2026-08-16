// Hub smoke: the playground landing page renders and links to the
// scenario pages the rest of this dogfood suite drives.

function test_hub_lists_scenarios() {
  step("Open the playground hub", () => {
    goto('/');
    waitForText('Stress-test browser');
  });

  step("Scenario links are present", () => {
    assertVisible(getByRole('link', {name: 'Big Table', exact: true}));
    assertVisible(getByRole('link', {name: 'Nested Iframes', exact: true}));
  });
}
