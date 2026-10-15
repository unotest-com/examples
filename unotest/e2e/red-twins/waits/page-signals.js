// Red twins (#449) of the timeoutMs of waitForNavigation, waitForPage and
// waitForRequest. Each page sends its signal — a navigation, a popup, a
// request — 1 s after a click. The twin waits {timeoutMs: 300} and fails
// before the signal comes, well before the wait's own default; the control
// waits long enough and gets it.
// Inline page (a data: URL, so no `#` in it: that starts the fragment).

function late_signals_page() {
  return 'data:text/html,<button>Leave</button><button>Popup</button><button>Request</button>' +
    '<script>const later = (fn) => () => setTimeout(fn, 1000);' +
    ' const [leave, popup, request] = document.querySelectorAll("button");' +
    ' leave.addEventListener("click", later(() => location.assign("https://fixtures.unotest.com/delay?ms=0")));' +
    ' popup.addEventListener("click", later(() => window.open("about:blank")));' +
    ' request.addEventListener("click", later(() => fetch("https://fixtures.unotest.com/delay?ms=0").catch(() => {})));' +
    '</script>';
}

function test_wait_for_navigation_timeout_twin() {
  step("Open the page", () => { goto(late_signals_page()); });

  step("Twin: waitForNavigation {timeoutMs: 300} gives up before the page leaves", () => {
    click(getByRole('button', {name: 'Leave'}));
    const started = nowMs();
    assert_failed_with(caught_message(() => waitForNavigation({timeoutMs: 300})), 'Timeout 300ms exceeded');
    assert_failed_in_time(started, 'waitForNavigation');
  });

  step("Control: waitForNavigation {timeoutMs: 5000} sees the page leave", () => {
    goto(late_signals_page());
    click(getByRole('button', {name: 'Leave'}));
    waitForNavigation({timeoutMs: 5000});
  });
}

function test_wait_for_page_timeout_twin() {
  step("Open the page", () => { goto(late_signals_page()); });

  step("Twin: waitForPage {timeoutMs: 300} gives up before the popup", () => {
    click(getByRole('button', {name: 'Popup'}));
    const started = nowMs();
    assert_failed_with(caught_message(() => waitForPage({timeoutMs: 300})), 'no new tab within 300 ms');
    assert_failed_in_time(started, 'waitForPage');
  });

  step("Control: waitForPage {timeoutMs: 5000} gets the popup", () => {
    const opened = waitForPage({timeoutMs: 5000});
    assertTrue(opened == 1, 'the popup is the second tab, got ' + opened);
  });
}

function test_wait_for_request_timeout_twin() {
  step("Open the page", () => { goto(late_signals_page()); });

  step("Twin: waitForRequest {timeoutMs: 300} gives up before the request", () => {
    click(getByRole('button', {name: 'Request'}));
    const started = nowMs();
    assert_failed_with(caught_message(() => waitForRequest('**/delay*', {timeoutMs: 300})), 'no request to "**/delay*" in 300 ms');
    assert_failed_in_time(started, 'waitForRequest');
  });

  step("Control: waitForRequest {timeoutMs: 5000} sees it", () => {
    click(getByRole('button', {name: 'Request'}));
    const request = waitForRequest('**/delay*', {timeoutMs: 5000});
    assertTrue(textContains(request.url, '/delay'), 'request: ' + request.url);
  });
}
