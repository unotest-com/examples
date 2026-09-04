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
