// Red twins (#449) of the checks that read what the page signalled — its
// console, its requests, the clipboard — and their options: each is called
// where it must fail and the message must name it; the same call on the
// right state passes next to it. Mocked pages on the playground's origin.

function signal_page() {
  return '<p data-testid="state">idle</p>' +
    '<button onclick="console.error(\'twin-console-error\')">Log an error</button>' +
    '<button onclick="setTimeout(() => { throw new Error(\'twin-page-error\'); })">Throw</button>' +
    '<button onclick="fetch(\'/twin-tracker\').catch(() => {}); document.querySelector(\'[data-testid=state]\').textContent = \'sent\'">Track</button>' +
    '<button onclick="navigator.clipboard.writeText(\'twin-copied\')">Copy</button>';
}

function open_signal_page() {
  mockRoute('**/twin-signals', {contentType: 'text/html', body: signal_page()});
  goto('/twin-signals');
}

function test_console_twins() {
  step("Open the page", () => { open_signal_page(); });

  step("assertNoConsoleErrors fails on a console error, passes on a quiet page", () => {
    assertNoConsoleErrors();
    click(getByRole('button', {name: 'Log an error'}));
    const message = caught_message(() => assertNoConsoleErrors());
    assert_failed_with(message, 'assertNoConsoleErrors');
    assert_failed_with(message, 'twin-console-error');
  });

  step("since: an error before it passes, an error after it fails", () => {
    const before = nowMs();
    assertNoConsoleErrors({since: before});
    click(getByRole('button', {name: 'Log an error'}));
    const message = caught_message(() => assertNoConsoleErrors({since: before}));
    assert_failed_with(message, 'assertNoConsoleErrors');
    assert_failed_with(message, 'twin-console-error');
  });
}

function test_page_error_twins() {
  step("Open the page", () => { open_signal_page(); });

  step("includePageErrors: an uncaught error fails it, false lets it pass", () => {
    click(getByRole('button', {name: 'Throw'}));
    waitUntil(() => pageErrors().length > 0, {timeoutMs: 3000});
    const message = caught_message(() => assertNoConsoleErrors({includePageErrors: true}));
    assert_failed_with(message, 'assertNoConsoleErrors');
    assert_failed_with(message, 'twin-page-error');
    assertNoConsoleErrors({includePageErrors: false});
  });
}

function test_request_and_clipboard_twins() {
  step("Open the page with the tracker stopped and recorded", () => {
    open_signal_page();
    mockRoute('**/twin-tracker', {abort: true, record: true});
  });

  step("assertNoRequest since: a request after it fails, none after a later mark passes", () => {
    const before = nowMs();
    click(getByRole('button', {name: 'Track'}));
    assertText(getByTestId('state'), 'sent');
    waitUntil(() => caught_message(() => assertNoRequest('**/twin-tracker', {since: before})) != '', {timeoutMs: 3000});
    assert_failed_with(caught_message(() => assertNoRequest('**/twin-tracker', {since: before})), 'assertNoRequest');
    assertNoRequest('**/twin-tracker', {since: nowMs()});
  });

  step("assertClipboard fails on other text within its timeout, passes on what was copied", () => {
    click(getByRole('button', {name: 'Copy'}));
    assertClipboard('twin-copied', {timeoutMs: 3000});
    const started = nowMs();
    assert_failed_with(caught_message(() => assertClipboard('something-else', {timeoutMs: 300})), 'assertClipboard');
    const took = nowMs() - started;
    assertTrue(took < 3000, 'assertClipboard failed after ' + took + ' ms, its timeoutMs is not honoured');
  });
}
