// Helpers for the viewer's own UI suite (unotest/e2e/viewer/*).

// Width of the overview's counter row, in CSS pixels.
//
// Layout geometry is the one thing no locator can express: a collapsed
// header is still present, still visible, still carries its text — width
// is the only signal that it got squeezed. Reading it is exactly what the
// escape hatch is for.
function overview_header_width() {
  return evaluate( // lint-ok: element geometry has no typed getter — the geometry IS the assertion
    '(() => Math.round(document.querySelector("button[aria-pressed]").parentElement.getBoundingClientRect().width))()'
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
