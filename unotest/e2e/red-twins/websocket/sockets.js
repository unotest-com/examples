// Red twin (#449) of waitForWebSocket: called on a mask no socket of the
// page matches, it must fail naming the mask; the same wait on the socket
// the page did open passes next to it.

function test_wait_for_websocket_twin() {
  step("Open the page that connects to /ws as it loads", () => {
    goto(env('APP_API_BASE_URL') + '/socket-page');
  });

  step("waitForWebSocket fails on a mask no socket matches, naming it", () => {
    assert_failed_with(caught_message(() => waitForWebSocket('**/never-opened', {timeoutMs: 500})), '**/never-opened');
    waitForWebSocket('**/ws', {timeoutMs: 10000});
  });
}
