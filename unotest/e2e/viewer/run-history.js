// Run history: the viewer has to show a past run's steps and the evidence
// captured with them. The fixture project ships one green run, one failed
// run and one collection run, all committed — the numbers below are facts
// about that fixture, not about our machine.

function test_run_history_opens_a_failed_run() {
  step("Open the runs panel", () => {
    goto('/');
    click(getByRole('button', {name: 'Runs'}));
    waitFor(getByRole('button', {name: /^Run smoke\/failing/}));
  });

  step("All three fixture runs are listed with their outcome", () => {
    assertVisible(getByRole('button', {name: /^Run smoke\/passing — passed/}));
    assertVisible(getByRole('button', {name: /^Run smoke\/failing — failed/}));
    assertVisible(getByRole('button', {name: /^Collection fixture/}));
  });

  step("The passed filter hides the failed run", () => {
    click(getByRole('button', {name: 'passed', exact: true}));
    assertVisible(getByRole('button', {name: /^Run smoke\/passing/}));
    assertHidden(getByRole('button', {name: /^Run smoke\/failing/}));
    click(getByRole('button', {name: 'all', exact: true}));
  });

  step("Opening the failed run shows both of its steps", () => {
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
