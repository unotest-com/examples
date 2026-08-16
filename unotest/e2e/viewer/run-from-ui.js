// The viewer is not just a log reader: its Run button launches the runner
// and streams the result back over the websocket. The fixture scenario
// drives about:blank, so this works with no network at all.

function test_run_button_executes_the_scenario() {
  step("Open the fixture's passing scenario", () => {
    goto('/');
    click(getByRole('button', {name: 'passing'}));
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
    waitForCount(getByRole('button', {name: /^Run smoke\/passing — passed/}), 2, {timeout: 15000});
  });
}
