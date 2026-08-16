// Always green, always offline — the run the viewer shows as a success,
// and the one its Run button re-executes.

function test_blank_page_is_reachable() {
  step("Open a blank page", () => {
    goto('about:blank');
    assertUrl('about:blank');
  });

  step("Log a line the viewer can display", () => {
    log('viewer fixture run');
    assertTrue(textContains(getUrl(), 'blank'), getUrl());
  });
}
