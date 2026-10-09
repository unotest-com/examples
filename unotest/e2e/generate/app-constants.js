// The app's constants, as `generate` wrote them before this run (#374):
// the JSON is not in git, it is rebuilt from the app source each time,
// so the texts asserted here cannot drift from the source by hand.

function test_constants_from_the_generate_step() {
  step("Read the generated constants", () => {
    hub = readJson('unotest/generated/app-constants.json').hub;
    assertTrue(hub.pages.length == 2, json(hub.pages));
  });

  step("The hub shows the generated title", () => {
    goto('/');
    waitForText(hub.title);
  });

  step("Each generated page shows its marker", () => {
    for (i = 0; i < hub.pages.length; i = i + 1) {
      goto(hub.pages[i].path);
      waitForText(hub.pages[i].marker);
    }
  });
}
