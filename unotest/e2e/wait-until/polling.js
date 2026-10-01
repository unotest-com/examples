// waitUntil — polling a condition no single wait covers: a number crossing
// a threshold on the page, and an API answering the way the test needs,
// with a bearer token from the secrets that must stay masked in the run.

function test_wait_until_polls_page_and_api() {
  step("A counter on the page crosses a threshold", () => {
    goto(clock_page_url());
    reached = waitUntil(() => parseJson(textContent(getByTestId('count'))) >= 5, {intervalMs: 100, label: 'counter reached 5'});
    assertTrue(reached === true, json(reached));
    assertTrue(parseJson(textContent(getByTestId('count'))) >= 5, 'the counter went back');
  });

  step("A block body polls an API and returns the answer it waited for", () => {
    answer = waitUntil(() => {
      echoed = apiCall('POST', '/echo', {poll: 'dogfood'}, {authorization: 'Bearer ' + MASKING_PROBE});
      if (echoed.status != 200) {
        return false;
      }
      return echoed.body.body.poll;
    }, {timeoutMs: 10000, label: 'echo answered'});
    assertTrue(answer == 'dogfood', json(answer));
  });
}
