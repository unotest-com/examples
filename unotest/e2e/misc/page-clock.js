// The page clock: clockFreeze stops time and every timer of the page —
// the counter and the "typing" dots stand still, so a screenshot of them
// is the same pixels every run; clockTick moves frozen time and fires
// what falls due; clockRun lets it go.

function test_page_clock_freezes_ticks_and_runs() {
  step("Frozen before the page loads: every run gets the same frame", () => {
    clockFreeze('2026-01-15T10:00:00Z');
    goto(clock_page_url());
    clockTick(250);
    assertText(getByTestId('count'), '2');
    assertText(getByTestId('typing'), 'typing..');
    screenshot('typing-frozen');
  });

  step("Run: time goes on by itself", () => {
    clockRun();
    waitForText(/^[5-9]$|^\d{2,}$/);
  });

  step("Frozen mid-page: Date reads the instant and the counter stands still", () => {
    clockFreeze('2026-01-15T10:00:00Z');
    frozen = textContent(getByTestId('count'));
    pause(400); // lint-ok: the step proves that NOTHING changes over real time — there is no state to wait for
    assertText(getByTestId('count'), frozen);
    now = evaluate('() => new Date().toISOString()'); // lint-ok: Date inside the page is the thing under test
    assertTrue(now == '2026-01-15T10:00:00.000Z', 'Date on the page: ' + now);
  });

  step("Tick 1500 ms: fifteen timer runs, time moved by as much", () => {
    clockTick(1500);
    later = evaluate('() => new Date().toISOString()'); // lint-ok: Date inside the page is the thing under test
    assertTrue(later == '2026-01-15T10:00:01.500Z', 'Date after the tick: ' + later);
    ticked = evaluate('(before) => Number(document.querySelector("[data-testid=count]").textContent) - Number(before)', frozen); // lint-ok: arithmetic over the counter, which no assert does
    assertTrue(ticked == 15, 'timer runs in 1500 ms: ' + ticked);
    clockRun();
  });
}
