// Deliberate error, the control of accept-045/read-json: a path that
// climbs out of the project is refused at once, naming the root — the
// sandbox holds for readJson as it does for uploads.
// A wrong call of the script checks nothing: the run is errored, not a
// failed check, so it carries no @expect-fail (dogfood-expect-fail.mjs
// holds it as an errored case). Outside unotest/e2e/: red for good, it
// would sit in the viewer's "Failing now" and hide real failures.

function test_read_json_outside_the_project() {
  step("Open the hub", () => {
    goto('/');
    waitForText('Stress-test browser');
  });

  step("Read a JSON file above the project", () => {
    outside = readJson('../package.json');
  });
}
