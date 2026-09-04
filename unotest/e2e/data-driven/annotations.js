// Run annotations. note() is called from a HELPER, so the viewer has to
// attribute it to the entry-file line that called the helper
// (entryLine/entryCol); log() from the step body lands in the journal and
// the System panel after the run; assertJudge leaves a verdict the viewer
// renders under the step, not only in the error card.

function test_run_annotations_from_helper_log_and_judge() {
  step("Read the fixture and annotate the row from a helper", () => {
    pages = 'unotest/fixtures/data/playground-pages.jsonl';
    row = readJsonLine(pages, {id: 'hub', enabled: true});
    flow_open_page_noted(row);
    log('opened', row.id, 'at', row.path);
  });

  step("Every note shape: string, number, object, secret", () => {
    note('page id', row.id);
    note('rows in fixture', 4);
    note('row', row);
    note('masking probe', MASKING_PROBE);
    log('notes written');
  });

  step("A judge verdict is attached to the step", () => {
    assertJudge(locator('h1'), 'must contain: stress-test');
    note('rubric', 'must contain: stress-test');
  });

  step("A long value is capped, not dropped", () => {
    big = randomText(6000);
    note('long text', big);
    assertTrue(textContains(big, ' '), 'randomText should produce prose');
  });
}
