// Data-driven gate (bot-service): the list of pages to visit lives in a
// JSONL fixture, not in the scenario. readJsonLine reads a file that is
// already there — no poll, no timeout masking "file not found" — and the
// screenshot is named by the row, so the evidence carries the id of the
// data that produced it. Keys are deliberately in a different order per
// line and the file ends with a non-JSON line the oracle must skip.

function test_pages_from_jsonl() {
  step("Visit every enabled page from the fixture, one screenshot per row", () => {
    pages = 'unotest/fixtures/data/playground-pages.jsonl';
    ids = ['hub', 'clicks', 'drag-drop'];
    for (i = 0; i < 3; i = i + 1) {
      id = ids[i];
      row = readJsonLine(pages, {id: id, enabled: true});
      assertTrue(row.id == id, json(row));
      flow_open_page(row);
      shot = screenshot(row.id);
      assertTrue(textContains(shot, id), shot);
    }
  });

  step("A multi-key filter skips the disabled row and the name can be built", () => {
    disabled = readJsonLine(pages, {id: 'iframes', enabled: false});
    assertTrue(disabled.path == '/scenarios/iframes', json(disabled));
    shot = screenshot(textJoin(['skipped-', disabled.id]));
    assertTrue(textContains(shot, 'skipped-iframes'), shot);
  });
}
