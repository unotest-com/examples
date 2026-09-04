// The overview field and a test marked @expect-fail: red on purpose is
// not an alarm. Frozen fixture project, see viewer/overview.

function test_overview_keeps_a_deliberate_failure_out_of_the_alarm() {
  step("Open the viewer on its Home tab", () => {
    flow_open_fixture_viewer();
    waitForText('OVERVIEW');
  });

  step("The test marked @expect-fail is red on purpose, not broken", () => {
    // Two of the three fixture runs failed. Only one of them is a
    // problem — an alarm that is always on is one nobody reads.
    assertVisible(getByRole('button', {name: /^smoke\/by-design — expected, /}));
    assertVisible(getByRole('heading', {name: '1 test is failing.'}));
  });

  step("Its own counter names it and filters the field down to it", () => {
    click(getByRole('button', {name: 'Show tests that failed on purpose'}));
    assertCount(getByRole('button', {name: /— (passed|failed|expected|never), /}), 1);
    assertVisible(getByRole('button', {name: /^smoke\/by-design — expected, /}));
  });

  step("Hovering it says why the tile is not green and not an alarm", () => {
    hover(getByRole('button', {name: /^smoke\/by-design — expected, /}));
    waitForText('expected to fail · @expect-fail');
  });
}
