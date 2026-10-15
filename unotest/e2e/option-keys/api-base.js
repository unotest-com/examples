// The base option of apiCall (#526). Without it the path goes to
// sandbox.apiBaseUrl (the fixture API); {base: 'APP_BASE_URL'} sends the same
// path to the host that variable of unotest/.env names (the playground). The
// fixture's /echo answers JSON with the method; the playground does not.

function test_api_call_base() {
  step("No base: /echo reaches the fixture API", () => {
    const res = apiCall('GET', '/echo');
    assertEqual(res.status, 200);
    assertEqual(res.body.method, 'GET');
    assertTrue(textContains(res.headers['content-type'], 'application/json'), json(res.headers));
  });

  step("{base: 'APP_API_BASE_URL'} names the same host: the same answer", () => {
    assertEqual(apiCall('GET', '/echo', null, {}, {base: 'APP_API_BASE_URL'}).body.method, 'GET');
  });

  step("{base: 'APP_BASE_URL'} sends /echo to the playground: its app page, not JSON", () => {
    const res = apiCall('GET', '/echo', null, {}, {base: 'APP_BASE_URL'});
    assertEqual(res.status, 200);
    assertTrue(textContains(res.headers['content-type'], 'text/html'), json(res.headers));
  });

  step("{base} naming a variable .env lacks is refused", () => {
    const message = caught_message(() => apiCall('GET', '/echo', null, {}, {base: 'NO_SUCH_API_BASE'}));
    assertTrue(textContains(message, 'names a variable of unotest/.env, and it is not there'), message);
  });
}
