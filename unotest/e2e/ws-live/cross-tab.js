// Cross-tab streaming: the publisher lives in a second window and reaches
// the feed through a BroadcastChannel. Two pages, one flow — the test has to
// drive the publisher tab, then come back and read the feed. Pausing the
// feed is the interesting part: messages keep arriving, but the paused DOM
// must NOT show them, and only a window assertion can prove that.

function test_publisher_tab_feeds_the_live_log() {
  step("Open the live feed", () => {
    goto('/scenarios/ws-live');
    waitFor(getByRole('log', {name: 'Live message feed'}));
    marker = randomWord(10);
  });

  step("Open the publisher in a second tab", () => {
    click(getByRole('button', {name: 'Open publisher'}));
    setPage(1);
    waitFor(getByPlaceholder('Hello from publisher'));
  });

  step("Publish one marked message with the Enter key", () => {
    fill(getByPlaceholder('Hello from publisher'), marker);
    click(getByRole('button', {name: 'warn', exact: true}));
    press(getByPlaceholder('Hello from publisher'), 'Enter');
  });

  step("The feed tab shows it", () => {
    setPage(0);
    waitForText(marker);
  });

  step("A paused feed swallows the next message", () => {
    click(getByRole('button', {name: 'Pause'}));
    setPage(1);
    quiet = randomWord(10);
    fill(getByPlaceholder('Hello from publisher'), quiet);
    click(getByRole('button', {name: 'Send'}));
    setPage(0);
    assertNeverAppears(getByText(quiet), {withinMs: 1200});
  });

  step("Resuming lets new messages through again", () => {
    // Whatever arrived while paused is gone for good — the feed drops its
    // pending buffer on resume, it does not replay it.
    click(getByRole('button', {name: 'Resume', exact: true}));
    setPage(1);
    fresh = randomWord(10);
    fill(getByPlaceholder('Hello from publisher'), fresh);
    click(getByRole('button', {name: 'Send'}));
    setPage(0);
    waitForText(fresh);
  });

  step("Clear empties the feed", () => {
    click(getByRole('button', {name: 'Clear'}));
    assertHidden(getByText(marker));
  });
}
