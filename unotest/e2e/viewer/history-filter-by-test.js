// Run history narrowed to one test: from a run to the test it ran, and
// from the test to its own history through a structural filter chip.
// Runs against the frozen fixture project (see viewer/run-history).

function test_history_narrows_to_one_test() {
  step("Open the failed run from history", () => {
    flow_open_fixture_viewer();
    click(getByRole('button', {name: 'Runs'}));
    click(getByRole('button', {name: /^Collection fixture/}));
    click(getByRole('button', {name: /^Run smoke\/failing/}));
    waitForText('Open a blank page');
  });

  step("The run's title leads back to the test it ran", () => {
    click(getByRole('button', {name: 'Open the test'}));
    waitFor(getByRole('button', {name: 'History'}));
  });

  step("History from the test filters to that test alone", () => {
    click(getByRole('button', {name: 'History'}));
    // A structural chip, not text in the search box: `smoke/failing`
    // typed as free text would also select `smoke/failing-extra`.
    waitFor(getByRole('button', {name: 'Clear test filter'}));
    assertVisible(getByRole('button', {name: /^Run smoke\/failing/}));
    assertHidden(getByRole('button', {name: /^Run smoke\/passing/}));
  });

  step("Clearing the chip brings the whole history back", () => {
    click(getByRole('button', {name: 'Clear test filter'}));
    assertVisible(getByRole('button', {name: /^Collection fixture/}));
  });
}
