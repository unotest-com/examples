// The overview field under a filter that matches nothing: the field
// empties, the header keeps its width. Frozen fixture project, see
// viewer/overview.

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
