// apiCall {timeoutMs} (#502) against the fixture API's /delay: a call that
// answers inside its budget returns as usual. The red side — a budget the
// endpoint overruns — is expect-fail/api-call-timeout.

function test_api_call_timeout_inside_the_budget() {
  step("A slow endpoint that answers inside the budget", () => {
    let res = apiCall('GET', '/delay?ms=300', null, null, {timeoutMs: 5000});
    assertEqual(res.status, 200);
    assertEqual(res.body.delayedMs, 300);
  });
}
