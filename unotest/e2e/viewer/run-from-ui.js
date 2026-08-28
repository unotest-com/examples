// The viewer is not just a log reader: its Run button launches the runner
// and streams the result back over the websocket. The fixture scenario
// drives about:blank, so this works with no network at all.

function test_run_button_executes_the_scenario() {
  step("Open the fixture's passing scenario", () => {
    flow_open_fixture_viewer();
    click(getByRole('button', {name: 'passing', exact: true}));
    waitForText('Log a line the viewer can display');
  });

  step("Run it headless from the UI", () => {
    click(getByRole('button', {name: 'Run', exact: true}));
  });

  step("The finished run reports both steps as done", () => {
    waitForText('Open a blank page', {timeout: 30000});
    assertVisible(getByRole('button', {name: 'Export', exact: false}));
  });

  step("It shows up in the run history as a fresh pass", () => {
    click(getByRole('button', {name: 'Runs'}));
    // One visible row for this run under today's heading. Two shapes are
    // legitimate: a single fresh run renders as "Run smoke/passing —
    // passed, …", while consecutive runs of the same scenario collapse
    // into one run-length row "smoke/passing — N runs, …" (a history
    // feature, not a loss). The fixture's committed passing run stays
    // folded inside its collection either way.
    waitForCount(getByRole('button', {name: /^(Run smoke\/passing — passed|smoke\/passing — \d+ runs)/}), 1, {timeout: 15000});
  });
}
