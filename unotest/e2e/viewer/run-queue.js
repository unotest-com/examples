// The run queue, seen from the viewer: a run ordered while the machine is
// busy waits its turn instead of fighting whatever is already driving the
// browser — and the human can see what is waiting and take it back out.
//
// The machine is made busy by a stand that holds a queue slot the way any
// other producer would (a terminal, an agent). That is what makes this
// deterministic: nothing here depends on how fast a browser starts.
//
// One test, not two: pressing Run writes a run into the frozen fixture
// copy, and the fixture stand retires a copy that has been written into —
// so every extra test here costs a full viewer reboot. The cancel path
// runs first precisely because cancelling leaves the copy untouched.

function test_a_busy_machine_queues_runs_and_the_human_stays_in_charge() {
  step("Open the viewer while something else holds the machine", () => {
    flow_open_fixture_viewer();
    shell('node', 'unotest/fixtures/viewer/queue-hold.mjs');
  });

  step("Pressing Run is accepted — and the run does not start", () => {
    click(getByRole('button', {name: 'passing', exact: true}));
    waitForText('Log a line the viewer can display');
    click(getByRole('button', {name: 'Run', exact: true}));
    click(getByRole('button', {name: 'Active'}));
    waitForText('slot busy');
    assertVisible(getByRole('button', {name: 'cancel queued smoke/passing'}));
  });

  step("A queued run can be taken back out of the queue", () => {
    click(getByRole('button', {name: 'cancel queued smoke/passing'}));
    waitForCount(getByRole('button', {name: 'cancel queued smoke/passing'}), 0);
    // A run that never started must not sit in its tab forever waiting
    // for events that will never come — cancelling ends it.
    waitForText('aborted', {timeout: 20000});
  });

  step("Order it again and give the machine back — it goes by itself", () => {
    // Back to the scenario's own tab: the Run button lives there, and the
    // pane is currently showing the run that was just cancelled.
    click(getByRole('button', {name: 'Scenarios'}));
    click(getByRole('button', {name: 'passing', exact: true}));
    click(getByRole('button', {name: 'Run', exact: true}));
    click(getByRole('button', {name: 'Active'}));
    waitForCount(getByRole('button', {name: 'cancel queued smoke/passing'}), 1);
    shell('node', 'unotest/fixtures/viewer/queue-hold.mjs', '--release');
    // Leaving the queue is only half of it: the run has to actually
    // HAPPEN. A queue that quietly drops what it drains would pass the
    // first check on its own, so wait for the scenario's own step text
    // to stream into the run tab.
    waitForCount(getByRole('button', {name: 'cancel queued smoke/passing'}), 0, {timeout: 20000});
    waitForText('Open a blank page', {timeout: 40000});
  });
}
