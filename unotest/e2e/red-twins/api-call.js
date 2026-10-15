// Red twins (#449) of apiCall's options, against the fixture API (the
// sandbox base) and the playground (APP_BASE_URL, set in every overlay):
// a call past its timeoutMs must fail by it, and a call to another base
// must get that host's answer. The same call on the right state passes
// next to each.

function test_api_call_twins() {
  step("timeoutMs: an endpoint slower than the budget fails in time, a quick one answers", () => {
    const started = nowMs();
    assert_failed_with(caught_message(() => apiCall('GET', '/delay?ms=3000', null, null, {timeoutMs: 300})), 'apiCall');
    assert_failed_in_time(started, 'apiCall');
    assertEqual(apiCall('GET', '/delay?ms=10', null, null, {timeoutMs: 10000}).status, 200);
  });

  step("base: the playground answers the fixture API's teapot path with its page", () => {
    assertEqual(apiCall('GET', '/status/418').status, 418);
    assert_failed_with(caught_message(() => assertEqual(apiCall('GET', '/status/418', null, null, {base: 'APP_BASE_URL'}).status, 418)), 'got 200');
  });
}
