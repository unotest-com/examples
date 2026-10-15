// waitForWebSocket (#539) on the fixture page that opens a socket to the
// fixture API as it loads: /socket-page connects to /ws, which echoes.

function test_socket_opened_on_load() {
  let socket;
  step("The page connects as it loads; a wait after that still finds the socket", () => {
    goto(env('APP_API_BASE_URL') + '/socket-page');
    socket = waitForWebSocket('**/ws', {timeoutMs: 10000});
    assertTrue(socket.url.endsWith('/ws'), 'socket url: ' + socket.url);
  });

  step("The socket is the page's own: its echo reaches the page", () => {
    assertText(locator('#status'), 'echo: ping');
  });
}
