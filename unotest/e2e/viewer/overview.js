// The viewer's overview field — one tile per scenario, on the pinned Home
// tab. Runs against the frozen fixture project (three scenarios: one green,
// one red, one red on purpose), so the counts are fixed. The fixture viewer
// comes up on demand — `pnpm dogfood:viewer`, a single `e2e viewer/overview`
// and the Run button in a viewer's own UI all work as-is.

function test_overview_shows_one_tile_per_scenario() {
  step("Open the viewer on its Home tab", () => {
    flow_open_fixture_viewer();
    waitForText('OVERVIEW');
  });

  step("The field has a tile per scenario, coloured by last outcome", () => {
    // A tile's accessible name is `<ref> — <status>, <when>`; the status
    // is what separates tiles from every other control on the screen,
    // and the time is the fade's counterpart for a screen reader.
    assertCount(getByRole('button', {name: /— (passed|failed|expected|never), /}), 3);
    assertVisible(getByRole('button', {name: /^smoke\/passing — passed, /}));
    assertVisible(getByRole('button', {name: /^smoke\/failing — failed, /}));
  });

  step("The headline counts the same failures the field shows", () => {
    assertVisible(getByRole('heading', {name: '1 test is failing.'}));
    assertVisible(getByRole('button', {name: 'Show failing tests'}));
  });

  step("A result this old is drawn faint, not at full strength", () => {
    // The fixture's runs are frozen weeks in the past, so every tile is
    // in the palest step. What this guards is that the fade happens at
    // all — a colour that never dims silently claims last month's pass
    // is today's — and that it stops short of erasing the colour.
    tile_fill = overview_first_tile_fill();
    assertTrue(tile_fill < 20, 'a weeks-old result must be drawn faint');
    assertTrue(tile_fill > 5, 'fading must not eat the colour it is fading');
  });
}

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

function test_overview_survives_a_filter_that_matches_nothing() {
  step("Open the viewer on its Home tab", () => {
    flow_open_fixture_viewer();
    waitForText('OVERVIEW');
    width_with_tiles = overview_header_width();
    assertTrue(width_with_tiles > 400, 'header should start at a readable width');
  });

  step("Filtering to failures leaves one tile", () => {
    click(getByRole('button', {name: 'Show failing tests'}));
    assertCount(getByRole('button', {name: /— (passed|failed|expected|never), /}), 1);
    assertVisible(getByRole('button', {name: /^smoke\/failing — failed, /}));
  });

  step("A filter matching nothing empties the field but not the header", () => {
    click(getByRole('button', {name: 'Show tests that never ran'}));
    assertCount(getByRole('button', {name: /— (passed|failed|expected|never), /}), 0);
    waitForText('nothing matches');
    // The regression this test exists for: tile size is fitted to the
    // pane and the header borrows that width, so a fit computed from the
    // FILTERED count collapsed the whole screen into one narrow column.
    // A collapsed header is still visible and still has its text — width
    // is the only signal.
    width_when_empty = overview_header_width();
    assertTrue(
      width_when_empty == width_with_tiles,
      'header width must not follow the filtered tile count'
    );
  });

  step("Going back to all restores the field", () => {
    click(getByRole('button', {name: 'Show all tests'}));
    assertCount(getByRole('button', {name: /— (passed|failed|expected|never), /}), 3);
  });
}
