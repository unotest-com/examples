// App constants the scenario must not repeat by hand: a build script
// would generate this JSON from the app's source, the scenario reads it
// with readJson and walks it with `.` and `[]`. The texts it asserts come
// from the file, so a wrong path or a wrong key fails here, not later.

function test_read_json_constants() {
  step("Read the constants and reach nested values", () => {
    shared = readJson('unotest/fixtures/data/shared-constants.json');
    assertTrue(shared.hub.pages[0].marker.text == 'Click me', json(shared.hub.pages[0]));
    assertTrue(shared.limits.maxTabs == 3, json(shared.limits));
    assertTrue(shared.limits.beta == null, json(shared.limits));
  });

  step("The hub shows the title from the constants", () => {
    goto('/');
    waitForText(shared.hub.title);
  });

  step("Each listed page shows its marker", () => {
    for (i = 0; i < 2; i = i + 1) {
      page = shared.hub.pages[i];
      goto(page.path);
      waitForText(page.marker.text);
    }
  });
}
