// @expect-fail
// Deliberate failure, the control of accept-045/read-json: a path that
// climbs out of the project is refused at once, naming the root — the
// sandbox holds for readJson as it does for uploads.

function test_read_json_outside_the_project() {
  step("Open the hub", () => {
    goto('/');
    waitForText('Stress-test browser');
  });

  step("Read a JSON file above the project", () => {
    outside = readJson('../package.json');
  });
}
