// Deliberate error: readJsonLine on a file that does not exist must fail
// at once with "file not found" — not sit in a poll until a timeout hides
// the real cause.
// A wrong call of the script checks nothing: the run is errored, not a
// failed check, so it carries no @expect-fail (dogfood-expect-fail.mjs
// holds it as an errored case). Outside unotest/e2e/: red for good, it
// would sit in the viewer's "Failing now" and hide real failures.

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
