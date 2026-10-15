// apiCall {timeoutMs} (#502) against the fixture API: a budget the service
// meets changes nothing about the reply. The side past the budget is a
// unit test on a real local server (packages/web/src/dsl/api-call.test.ts):
// the fixture API has no slow route to aim at.

function test_api_call_within_budget() {
  step("A reply inside the budget comes back as usual", () => {
    const echoed = apiCall('POST', '/echo', {hello: 'budget'}, {'x-dogfood': 'timeout'}, {timeoutMs: 15000});
    assertTrue(echoed.status == 200, 'echo should answer 200');
    assertTrue(echoed.body.body.hello == 'budget', json(echoed.body));
    assertTrue(echoed.body.headers['x-dogfood'] == 'timeout', 'custom header was dropped');
  });

  step("A non-2xx status inside the budget is still data", () => {
    const teapot = apiCall('GET', '/status/418', null, null, {timeoutMs: 15000});
    assertTrue(teapot.status == 418, 'the status should come back verbatim');
  });
}
