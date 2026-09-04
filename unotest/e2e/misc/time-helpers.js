// Value helpers: dates come from the runner, not the page, so a scenario
// can build "yesterday" without importing anything.

function test_time_helpers_produce_usable_values() {
  step("Epoch milliseconds move forward", () => {
    started = nowMs();
    pause(60); // lint-ok: measuring nowMs() needs a real gap, nothing to wait FOR
    assertTrue(nowMs() > started, 'nowMs must advance');
  });

  step("Dates are ISO-shaped and relative days line up", () => {
    stamp = today();
    assertTrue(textContains(stamp, '-'), stamp);
    assertTrue(daysFromNow(0) == stamp, 'daysFromNow(0) should equal today()');
    assertTrue(daysFromNow(1) > stamp, 'tomorrow should sort after today');
    assertTrue(daysFromNow(-1) < stamp, 'yesterday should sort before today');
    log('dogfood window', daysFromNow(-1), stamp, daysFromNow(1));
  });
}
