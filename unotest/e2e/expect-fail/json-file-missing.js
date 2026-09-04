// @expect-fail
// Deliberate failure: readJsonLine on a file that does not exist must fail
// at once with "file not found" — not sit in a poll until a timeout hides
// the real cause.

function test_read_json_line_missing_file() {
  step("Open the hub", () => {
    goto('/');
    waitForText('Stress-test browser');
  });

  step("Read a row from a fixture that is not there", () => {
    row = readJsonLine('unotest/fixtures/data/does-not-exist.jsonl', {id: 'hub'});
    assertTrue(row.id == 'hub', json(row));
  });
}
