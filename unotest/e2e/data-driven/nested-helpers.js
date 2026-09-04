// Helper inside helper — the entry step calls flow_visit_and_verify,
// which calls flow_open_page and flow_verify_page, each with steps of
// its own. Everything passes; the journal is the
// fixture for the trace tree: step envelopes nested three frames deep,
// every event carrying file/line/col of the helper AND entryLine/entryCol
// of the entry statement.

function test_helper_calls_helper_with_steps() {
  step("Visit two fixture pages through nested helpers", () => {
    pages = 'unotest/fixtures/data/playground-pages.jsonl';
    ids = ['hub', 'clicks'];
    for (i = 0; i < 2; i = i + 1) {
      row = readJsonLine(pages, {id: ids[i], enabled: true});
      step("Fixture page", {tag: row.id}, () => {
        flow_visit_and_verify(row);
      });
    }
  });

  step("A helper step next to an entry step is not confused with it", () => {
    flow_verify_page(row);
    assertTrue(row.id == 'clicks', row.id);
  });
}
