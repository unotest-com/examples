// #484: wait for the answer before checking what it draws — or must not.
// The page and its API come from mockRoute on an origin nobody serves; each
// button fetches after a delay, so a check made right after the click runs
// before the answer. The page fetches /api/items as it loads too: the wait
// after a click must take the click's request, not the load's.

function response_page_html() {
  return '<ul id="items"></ul><ul id="empty"></ul>' +
    '<button id="load">Load</button><button id="none">Load none</button><button id="broken">Broken</button>' +
    '<script>' +
    'const later = (fn) => setTimeout(fn, 400);' +
    'const draw = (list, testid) => (d) => { for (const t of d.items) {' +
    ' const li = document.createElement("li"); li.dataset.testid = testid; li.textContent = t;' +
    ' document.getElementById(list).append(li); } };' +
    'fetch("/api/items?from=load");' +
    'document.getElementById("load").onclick = () => later(() =>' +
    ' fetch("/api/items?from=click").then((r) => r.json()).then(draw("items", "item")));' +
    'document.getElementById("none").onclick = () => later(() =>' +
    ' fetch("/api/none").then((r) => r.json()).then(draw("empty", "empty-item")));' +
    'document.getElementById("broken").onclick = () => later(() => fetch("/api/broken"));' +
    '</script>';
}

function test_wait_for_response() {
  let res;
  let before;
  let message;
  let started;
  step("Open the page; it fetches /api/items as it loads", () => {
    mockRoute('https://response-page.unotest.test/', {body: response_page_html(), contentType: 'text/html'});
    mockRoute('https://response-page.unotest.test/api/items*', {body: {items: ['first']}});
    mockRoute('https://response-page.unotest.test/api/none', {body: {items: []}});
    mockRoute('https://response-page.unotest.test/api/broken', {status: 404, body: {error: 'gone'}});
    goto('https://response-page.unotest.test/');
  });

  step("After a click: the click's answer, not the load's; a log between moves nothing", () => {
    click(getByRole('button', {name: 'Load'}));
    log('between the click and the wait');
    res = waitForResponse('**/api/items*', {status: 200, method: 'get'});
    assertTrue(textContains(res.url, 'from=click'), json(res));
    assertTrue(res.ok && res.mocked && res.json.items[0] == 'first', json(res));
    assertTrue(textContains(res.headers['content-type'], 'json'), json(res));
    assertVisible(getByTestId('item'));
  });

  step("An empty answer: once it is in, nothing it would draw appears", () => {
    click(getByRole('button', {name: 'Load none'}));
    res = waitForResponse('**/api/none', {timeoutMs: 5000});
    assertTrue(res.json.items.length == 0 && res.text == '{"items":[]}', json(res));
    assertNeverAppears(getByTestId('empty-item'), {withinMs: 500});
  });

  step("Red twins: another status, another method, a later since — each names why", () => {
    click(getByRole('button', {name: 'Broken'}));
    message = caught_message(() => waitForResponse('**/api/broken', {status: 200, timeoutMs: 1000}));
    assert_failed_with(message, '/api/broken 404');
    message = caught_message(() => waitForResponse('**/api/broken', {method: 'POST', timeoutMs: 500}));
    assert_failed_with(message, 'GET https://response-page.unotest.test/api/broken (not POST)');
    res = waitForResponse('**/api/broken', {status: 404});
    assertTrue(!res.ok && res.json.error == 'gone', json(res));
    started = nowMs();
    message = caught_message(() => waitForResponse('**/api/broken', {since: nowMs(), timeoutMs: 500}));
    assert_failed_with(message, 'sent before {since}');
    assert_failed_in_time(started, 'waitForResponse');
  });

  step("Another action between: the wait looks from it, {since} from before the click", () => {
    before = nowMs();
    click(getByRole('button', {name: 'Load'}));
    waitForCount(getByTestId('item'), 2);
    hover(getByRole('button', {name: 'Broken'}));
    message = caught_message(() => waitForResponse('**/api/items*', {timeoutMs: 500}));
    assert_failed_with(message, 'before the last page action');
    res = waitForResponse('**/api/items*', {since: before});
    assertTrue(textContains(res.url, 'from=click'), json(res));
    unmockRoute();
  });
}
