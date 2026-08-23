// Helpers for the viewer's own UI suite (unotest/e2e/viewer/*).

// Width of the overview's counter row, in CSS pixels.
//
// Layout geometry is the one thing no locator can express: a collapsed
// header is still present, still visible, still carries its text — width
// is the only signal that it got squeezed. Reading it is exactly what the
// escape hatch is for.
function flow_overview_header_width() {
  return evaluate( // lint-ok: element geometry has no typed getter — the geometry IS the assertion
    '(() => Math.round(document.querySelector("button[aria-pressed]").parentElement.getBoundingClientRect().width))()'
  );
}
