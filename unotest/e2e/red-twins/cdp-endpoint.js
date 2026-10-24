// Red twin (#453) of newContext({cdpEndpoint}): a browser that is not
// there is one line that names the endpoint — not a hang until the
// connection gives up, and not a bare "connection refused" with no address.

function test_unreachable_cdp_endpoint_names_itself() {
  step("An endpoint nothing listens on is refused, naming it", () => {
    assert_failed_with(caught_message(() => {
      newContext({cdpEndpoint: 'http://127.0.0.1:9'});
    }), 'http://127.0.0.1:9');
  });

  step("Control: the run's own browser is untouched", () => {
    mockRoute('**/cdp-twin', {contentType: 'text/html', body: '<!doctype html><p>still here</p>'});
    goto('https://cdp-twin.test/cdp-twin');
    assertVisible(getByText('still here'));
  });
}
