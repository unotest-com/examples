// The overview field draws nothing inside a tile — the name only exists
// under the cursor. Frozen fixture project, see viewer/overview.

function test_overview_hover_reveals_the_test_behind_a_tile() {
  step("Open the viewer on its Home tab", () => {
    flow_open_fixture_viewer();
    waitForText('OVERVIEW');
  });

  step("Hovering the red tile names it and dates its last run", () => {
    // Nothing is drawn inside a tile — the whole point is that the field
    // stays quiet — so the name only exists under the cursor.
    hover(getByRole('button', {name: /^smoke\/failing — failed, /}));
    waitForText('smoke/failing');
    assertVisible(getByText('newest right'));
  });
}
