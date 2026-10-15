// assertNever — a negative window for a condition, the pair of
// assertNeverAppears. The clock page ticks every 100 ms: its "typing"
// indicator never shows four dots, and its counter crosses 3 within about
// 300 ms.

function test_assert_never_watches_a_condition() {
  step("A condition that never holds passes after the whole window", () => {
    goto(clock_page_url());
    assertNever(() => textContent(getByTestId('typing')) == 'typing....', {withinMs: 1500, intervalMs: 50, label: 'four dots'});
  });

  step("A block body returns the value it watches", () => {
    assertNever(() => {
      let n = parseJson(textContent(getByTestId('count')));
      if (n < 0) {
        return n;
      }
      return false;
    }, {withinMs: 500});
  });

  step("A condition that turns true fails at that moment, not at the window's end", () => {
    goto(clock_page_url());
    let started = nowMs();
    let caught = '';
    try {
      assertNever(() => parseJson(textContent(getByTestId('count'))) >= 3, {withinMs: 10000, intervalMs: 50, label: 'counter below 3'});
    } catch (e) {
      caught = e.message;
    }
    let tookMs = nowMs() - started;
    assertTrue(textContains(caught, 'assertNever "counter below 3": truthy at'), caught);
    assertTrue(tookMs < 5000, 'took ' + tookMs + ' ms of a 10000 ms window');
  });
}
