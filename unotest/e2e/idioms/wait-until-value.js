// Idiom: poll until a value is good enough, and keep it.
// Habit: for (i = 0; i < 20; i++) { v = read(); if (ok(v)) break; pause(250); }
// Typed step: waitUntil(() => …) retries a falsy value and gives the truthy
// one back. A variable set inside the body keeps its value between tries.

function ticking_page_url() {
  return 'data:text/html,<div data-testid="count">0</div>' +
    '<script>let n = 0; setInterval(() => { n++;' +
    ' document.querySelector("[data-testid=count]").textContent = String(n); }, 100);</script>';
}

function test_idiom_wait_until_value() {
  step("Open a counter that ticks every 100 ms", () => {
    goto(ticking_page_url());
    waitFor(getByTestId('count'));
  });

  step("Wait for 5 or more; keep the value and the number of tries", () => {
    let tries = 0;
    let reached = waitUntil(() => {
      tries = tries + 1;
      let n = parseJson(textContent(getByTestId('count')));
      if (n < 5) {
        return false;
      }
      return n;
    }, {timeoutMs: 5000, intervalMs: 100, label: 'count at 5'});
    assertTrue(reached >= 5, json(reached));
    assertTrue(tries >= 1, json(tries));
    note('tries', tries);
  });
}
