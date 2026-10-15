// Idiom: give one HTTP call a time limit.
// Habit: apiCall(method, path, body, headers, options, {timeout: 120000}) —
// a sixth argument 0.49.2 dropped without a word and 0.50.0 refuses.
// Typed option: {timeoutMs} in the options slot, the budget for the whole
// call; past it the step fails as a timeout naming the call.
// Needs sandbox.apiBaseUrl in unotest.config: the endpoint here is
// GET /delay?ms=N of the dogfood fixture API.

function test_idiom_api_call_timeout() {
  step("An endpoint that answers inside the budget", () => {
    let res = apiCall('GET', '/delay?ms=200', null, null, {timeoutMs: 5000});
    assertEqual(res.status, 200);
  });
}
