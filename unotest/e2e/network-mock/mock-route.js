// Route mocks, end to end: the page, its API and a tracker all answer from
// mockRoute — the page lives on an origin nobody serves, so every byte it
// shows came from a mock, and nothing reaches the network by accident:
// the first mask aborts and records everything the later masks do not answer.

function mock_page_html() {
  return '<p data-testid="msg">empty</p><p data-testid="sent">-</p><p data-testid="track">-</p>' +
    '<button id="load">Load</button><button id="send">Send</button><button id="track">Track</button>' +
    '<script>' +
    'const show = (id, text) => { document.querySelector("[data-testid=" + id + "]").textContent = text; };' +
    'document.getElementById("load").onclick = () => fetch("/api/last-message").then((r) => r.json())' +
    '.then((j) => show("msg", j.text), () => show("msg", "failed"));' +
    'document.getElementById("send").onclick = () => fetch("/api/send", {method: "POST",' +
    ' headers: {"content-type": "application/json"}, body: JSON.stringify({room: 7, text: "hello"})})' +
    '.then((r) => r.text()).then((t) => show("sent", t));' +
    'document.getElementById("track").onclick = () => fetch("https://tracker.unotest.test/pixel")' +
    '.then(() => show("track", "reached"), () => show("track", "blocked"));' +
    '</script>';
}

// The allowlist from the reference, key for key: `{continue: true}` is written
// bare, as a reader copies it — `continue` is a DSL keyword, and this line is
// what proves the parser takes it as an object key.
function allowlist_page_html() {
  return '<p data-testid="app">-</p><p data-testid="track">-</p>' +
    '<button id="app">App</button><button id="track">Track</button>' +
    '<script>' +
    'const probe = (id, url) => fetch(url, {mode: "no-cors"})' +
    '.then(() => { document.querySelector("[data-testid=" + id + "]").textContent = "reached"; },' +
    ' () => { document.querySelector("[data-testid=" + id + "]").textContent = "blocked"; });' +
    'document.getElementById("app").onclick = () => probe("app", "https://playground.unotest.com/");' +
    'document.getElementById("track").onclick = () => probe("track", "https://tracker.unotest.test/pixel");' +
    '</script>';
}

function test_mock_route_answers_the_page() {
  step("A mocked API answers what the page shows", () => {
    site = 'https://mock-page.unotest.test/';
    mockRoute('**/*', {abort: true, record: true});
    mockRoute(site, {body: mock_page_html(), contentType: 'text/html'});
    mockRoute('**/api/last-message', {body: {text: 'Hello from the mock'}});
    goto(site);
    click(getByRole('button', {name: 'Load'}));
    assertText(getByTestId('msg'), 'Hello from the mock');
  });

  step("Mocking the mask again replaces the answer", () => {
    mockRoute('**/api/last-message', {body: {text: 'Second answer'}});
    click(getByRole('button', {name: 'Load'}));
    assertText(getByTestId('msg'), 'Second answer');
  });

  step("waitForRequest returns what the page sent, body included", () => {
    mockRoute('**/api/send', {body: 'stored'});
    click(getByRole('button', {name: 'Send'}));
    assertText(getByTestId('sent'), 'stored');
    req = waitForRequest('**/api/send', {timeoutMs: 5000});
    assertTrue(req.method == 'POST', 'method: ' + req.method);
    assertTrue(req.postDataJson.text == 'hello', 'body: ' + req.postData);
  });

  step("A request no later mask answers is stopped and recorded", () => {
    click(getByRole('button', {name: 'Track'}));
    assertText(getByTestId('track'), 'blocked');
    after = nowMs();
    assertNoRequest('**/*', {since: after});
  });

  step("unmockRoute takes the answer off: the API falls to the abort", () => {
    unmockRoute('**/api/last-message');
    click(getByRole('button', {name: 'Load'}));
    assertText(getByTestId('msg'), 'failed');
    unmockRoute();
  });

  step("The later continue mask lets the app through the abort", () => {
    site = 'https://allowlist-page.unotest.test/';
    mockRoute('**/*', {abort: true, record: true});
    mockRoute('**/playground.unotest.com/**', {continue: true});
    mockRoute(site, {body: allowlist_page_html(), contentType: 'text/html'});
    goto(site);
    before = nowMs();
    click(getByRole('button', {name: 'App'}));
    assertText(getByTestId('app'), 'reached');
    assertNoRequest('**/*', {since: before});
  });

  step("Control: what the allowlist does not name is still stopped", () => {
    click(getByRole('button', {name: 'Track'}));
    assertText(getByTestId('track'), 'blocked');
    unmockRoute();
  });
}
