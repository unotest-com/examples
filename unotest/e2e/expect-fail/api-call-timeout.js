// @expect-fail
// #502: an endpoint slower than the call's {timeoutMs} — the request is
// aborted and the step fails as a timeout naming the call, without the
// base or the query.

function test_api_call_times_out() {
  step("Call an endpoint slower than its budget", () => {
    goto('data:text/html,<p>api timeout</p>');
    apiCall('GET', '/delay?ms=3000', null, null, {timeoutMs: 500});
  });
}
