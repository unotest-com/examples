// Run history: the viewer has to show a past run's steps and the evidence
// captured with them. The fixture project ships one green run, one failed
// run and one collection run, all committed — the numbers below are facts
// about that fixture, not about our machine.
//
// The two scenario runs are CHILDREN of the collection run, so history
// shows them folded into it: one suite, one row. That folding is the
// point of the grouping — a suite of 23 tests must not be 23 rows every
// hour — so the fixture exercising it is the fixture we want.

function test_run_history_opens_a_failed_run() {
  step("Open the runs panel", () => {
    flow_open_fixture_viewer();
    click(getByRole('button', {name: 'Runs'}));
    waitFor(getByRole('button', {name: /^Collection fixture/}));
  });

  step("The suite is one row carrying its tally, not one row per test", () => {
    assertVisible(getByRole('button', {name: /^Collection fixture — 1 passed, 1 failed/}));
    assertHidden(getByRole('button', {name: /^Run smoke\/failing/}));
  });

  step("Expanding the suite reveals both of its runs", () => {
    click(getByRole('button', {name: /^Collection fixture/}));
    assertVisible(getByRole('button', {name: /^Run smoke\/passing — passed/}));
    assertVisible(getByRole('button', {name: /^Run smoke\/failing — failed/}));
  });

  step("The passed filter hides the failed run", () => {
    click(getByRole('button', {name: 'passed', exact: true}));
    assertHidden(getByRole('button', {name: /^Run smoke\/failing/}));
    click(getByRole('button', {name: 'all', exact: true}));
  });

  step("Opening the failed run shows both of its steps", () => {
    // The suite is still expanded from the step above — clicking its row
    // again would fold it back up.
    click(getByRole('button', {name: /^Run smoke\/failing/}));
    waitForText('Open a blank page');
    assertVisible(getByText('Wait for something that will never exist'));
  });

  step("The inspector offers the captured evidence", () => {
    assertVisible(getByRole('button', {name: 'Screenshot'}));
    assertVisible(getByRole('button', {name: 'Console'}));
    assertVisible(getByRole('button', {name: 'Network'}));
  });
}
