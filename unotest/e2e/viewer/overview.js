// The viewer's overview field — one tile per scenario, shown while no tab
// is open. Runs against the frozen fixture project (two scenarios: one
// green, one red), so the counts are fixed —
// scripts/dogfood-viewer.mjs starts it and passes the URL in.

function test_overview_shows_one_tile_per_scenario() {
  step("Open the viewer on an empty workspace", () => {
    goto('/');
    waitForText('OVERVIEW');
  });

  step("The field has a tile per scenario, coloured by last outcome", () => {
    // A tile's accessible name is `<ref> — <status>`; the trailing status
    // is what separates tiles from every other control on the screen.
    assertCount(getByRole('button', {name: /— (passed|failed|never)$/}), 2);
    assertVisible(getByRole('button', {name: 'smoke/passing — passed'}));
    assertVisible(getByRole('button', {name: 'smoke/failing — failed'}));
  });

  step("The headline counts the same failures the field shows", () => {
    assertVisible(getByRole('heading', {name: '1 test is failing.'}));
    assertVisible(getByRole('button', {name: 'Show failing tests'}));
  });
}

function test_overview_hover_reveals_the_test_behind_a_tile() {
  step("Open the viewer on an empty workspace", () => {
    goto('/');
    waitForText('OVERVIEW');
  });

  step("Hovering the red tile names it and dates its last run", () => {
    // Nothing is drawn inside a tile — the whole point is that the field
    // stays quiet — so the name only exists under the cursor.
    hover(getByRole('button', {name: 'smoke/failing — failed'}));
    waitForText('smoke/failing');
    assertVisible(getByText('newest right'));
  });
}

function test_overview_survives_a_filter_that_matches_nothing() {
  step("Open the viewer on an empty workspace", () => {
    goto('/');
    waitForText('OVERVIEW');
    width_with_tiles = flow_overview_header_width();
    assertTrue(width_with_tiles > 400, 'header should start at a readable width');
  });

  step("Filtering to failures leaves one tile", () => {
    click(getByRole('button', {name: 'Show failing tests'}));
    assertCount(getByRole('button', {name: /— (passed|failed|never)$/}), 1);
    assertVisible(getByRole('button', {name: 'smoke/failing — failed'}));
  });

  step("A filter matching nothing empties the field but not the header", () => {
    click(getByRole('button', {name: 'Show tests that never ran'}));
    assertCount(getByRole('button', {name: /— (passed|failed|never)$/}), 0);
    waitForText('nothing matches');
    // The regression this test exists for: tile size is fitted to the
    // pane and the header borrows that width, so a fit computed from the
    // FILTERED count collapsed the whole screen into one narrow column.
    // A collapsed header is still visible and still has its text — width
    // is the only signal.
    width_when_empty = flow_overview_header_width();
    assertTrue(
      width_when_empty == width_with_tiles,
      'header width must not follow the filtered tile count'
    );
  });

  step("Going back to all restores the field", () => {
    click(getByRole('button', {name: 'Show all tests'}));
    assertCount(getByRole('button', {name: /— (passed|failed|never)$/}), 2);
  });
}
