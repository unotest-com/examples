// Idiom: a condition must never hold.
// Habit: pause(2000), then one assert on a counter. A value that crossed
// the line and came back inside the pause is missed.
// Typed step: assertNever(() => condition, {withinMs}) polls the whole
// window and names the moment and the value it saw.

function counter_page_url() {
  return 'data:text/html,<div data-testid="count">0</div>' +
    '<script>let n = 0; setInterval(() => { n = (n + 1) %25 5;' +
    ' document.querySelector("[data-testid=count]").textContent = String(n); }, 100);</script>';
}

function test_idiom_never_condition() {
  step("Open a counter that wraps at 5", () => {
    goto(counter_page_url());
    // The counter really ticks: a frozen one would pass the window below
    // for nothing.
    waitUntil(() => textContent(getByTestId('count')) == '4', {timeoutMs: 3000, intervalMs: 20, label: 'count reaches 4'});
  });

  step("The counter never reaches 5", () => {
    assertNever(() => parseJson(textContent(getByTestId('count'))) >= 5, {withinMs: 2000, intervalMs: 50, label: 'count at 5 or more'});
  });
}
