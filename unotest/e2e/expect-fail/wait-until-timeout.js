// @expect-fail
// #299: a condition that never holds — waitUntil fails the step when the
// timeout runs out, naming its label, how often it tried and the last value.
// The counter page's "typing" indicator has at most three dots.

function test_wait_until_times_out() {
  step("Wait for four dots that never come", () => {
    goto(clock_page_url());
    waitUntil(() => textContent(getByTestId('typing')) == 'typing....', {timeoutMs: 600, intervalMs: 100, label: 'typing shows four dots'});
  });
}
