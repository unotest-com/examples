// The viewer's left rail and scenario tree. Runs against a frozen fixture
// project (unotest/fixtures/viewer-project) so what the panes list never
// depends on what we happened to run today —
// scripts/dogfood-viewer.mjs starts it and passes the URL in.

function test_scenario_tree_lists_and_opens_a_test() {
  step("Open the viewer", () => {
    goto('/');
    waitFor(getByRole('button', {name: 'Scenarios'}));
  });

  step("The fixture project's scenarios are listed", () => {
    // Scenarios is the section the viewer opens on; clicking its rail
    // button again would COLLAPSE the pane (VS Code behaviour).
    // `exact` throughout: a scenario named `failing` is a substring of
    // any control that mentions failing tests — the rail's badge label
    // says "1 test failing now" — and a loose match would pick up both.
    assertVisible(getByRole('button', {name: 'passing', exact: true}));
    assertVisible(getByRole('button', {name: 'failing', exact: true}));
  });

  step("The filter narrows the tree", () => {
    fill(getByPlaceholder('Filter scenarios…'), 'passing');
    assertVisible(getByRole('button', {name: 'passing', exact: true}));
    assertHidden(getByRole('button', {name: 'failing', exact: true}));
  });

  step("Opening a scenario shows its steps", () => {
    click(getByRole('button', {name: 'passing', exact: true}));
    waitForText('Log a line the viewer can display');
    assertVisible(getByRole('button', {name: 'Run', exact: true}));
  });

  step("The Code view shows the test source itself", () => {
    click(getByRole('button', {name: 'Code', exact: true}));
    waitForText('test_blank_page_is_reachable');
  });
}
