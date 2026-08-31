// Helpers for the viewer's own UI suite (unotest/e2e/viewer/*).

// Open the viewer under test: bring it up if it is down, go to it, and
// prove it is the FIXTURE one.
//
// The app under test here is a viewer over a frozen fixture project, not
// the playground — so this navigates to VIEWER_URL (unotest/.env) instead
// of baseUrl. That is what makes these scenarios work everywhere: no
// environment to pick, no wrapper script, so `unotest-web e2e`, the Run
// button in a viewer's UI and an agent's `run_test` all behave the same.
//
// The ensure call is idempotent and returns in milliseconds once the
// fixture viewer is up; it exits non-zero — failing this step with its
// message — when the port is held by SOMEONE ELSE'S viewer. The text check
// is the other half of that guard, for the case where a stranger's viewer
// answers and the ensure never had to run: the tree header names the open
// project, and the fixture copy has a name of its own. Without both, the
// suite would quietly test somebody else's project and report failures
// about scenarios that were never supposed to be there.
function flow_open_fixture_viewer() {
  shell('node', 'unotest/fixtures/viewer/server.mjs', '--ensure');
  goto(VIEWER_URL);
  waitForText('viewer-fixture');
}

// Width of the overview's counter row, in CSS pixels.
//
// Layout geometry is the one thing no locator can express: a collapsed
// header is still present, still visible, still carries its text — width
// is the only signal that it got squeezed. Reading it is exactly what the
// escape hatch is for.
//
// Anchored on the "Show all tests" card, not on the first
// `button[aria-pressed]` in the document: the `last run | schedule`
// toggle is also a pressed-button group and mounts ABOVE the cards, so
// "first" quietly started measuring the toggle instead of the row.
function overview_header_width() {
  return evaluate( // lint-ok: element geometry has no typed getter — the geometry IS the assertion
    '(() => Math.round(document.querySelector(\'button[aria-label="Show all tests"]\').parentElement.getBoundingClientRect().width))()'
  );
}

// How much ink the first tile is filled with, as alpha ×100.
//
// The overview lays the status colour down more faintly the older the
// result is, and the fixture's runs are frozen in the past — so this must
// come back far below a fresh tile's strength. Same problem as the width
// above: a tile that quietly stopped fading looks perfectly fine to every
// locator. `[data-age]` is the tile's hook for exactly this.
function overview_first_tile_fill() {
  return evaluate( // lint-ok: computed style has no typed getter — the fade IS the assertion
    '(() => { const p = getComputedStyle(document.querySelector("[data-age]")).backgroundColor.match(/[0-9.]+/g);' +
      ' return Math.round(100 * (p.length < 4 ? 1 : Number(p[3]))); })()'
  );
}
