// Negative window assertions (bot-service round 3): prove that
// something did NOT happen within an explicit window — the opposite of
// every waitFor*. The live feed gets no publisher here, so a random
// marker must never show up; same for a file nobody seeds.

function test_nothing_appears_without_a_publisher() {
  step("Open the live feed without publishing anything", () => {
    goto('/scenarios/ws-live');
    marker = randomWord(10);
  });

  step("The marker never appears in the feed within the window", () => {
    assertNeverAppears(getByText(marker), {withinMs: 1500});
  });

  step("No stray file shows up either", () => {
    assertNoFile(textJoin(['.dogfood-probe-', marker, '.log']), {withinMs: 500});
  });

  step("textContains probes strings read back from the page", () => {
    url = getUrl();
    assertTrue(textContains(url, 'ws-live'), url);
  });
}
