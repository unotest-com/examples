// #558: the answers the page got, in a scenario. The page and its API come
// from mockRoute on an origin nobody serves, so every status and body below
// is one a mock gave: a click verifies a phone number and the page shows
// nothing of it; the scenario reads the status and the `kind` from the
// recorded response. The control is the request that failed.

function verify_page_html() {
  return '<p data-testid="state">idle</p><button id="verify">Verify</button><button id="refuse">Refuse</button>' +
    '<script>' +
    'const done = () => { document.querySelector("[data-testid=state]").textContent = "sent"; };' +
    'document.getElementById("verify").onclick = () => fetch("/api/contacts/verify", {method: "POST",' +
    ' headers: {"content-type": "application/json"}, body: JSON.stringify({phone: "+15550100"})}).then(done);' +
    'document.getElementById("refuse").onclick = () => fetch("/api/contacts/verify-code").then(done);' +
    '</script>';
}

function test_network_entries() {
  let before;
  let answers;
  let answer;
  step("A click that fetches: the status and the body of the answer are readable", () => {
    mockRoute('https://verify-page.unotest.test/', {body: verify_page_html(), contentType: 'text/html'});
    mockRoute('https://verify-page.unotest.test/api/contacts/verify', {body: {kind: 'mobile', country: 'US'}});
    mockRoute('https://verify-page.unotest.test/api/contacts/verify-code', {status: 422, body: {error: 'bad code'}});
    goto('https://verify-page.unotest.test/');
    before = nowMs();
    click(getByRole('button', {name: 'Verify'}));
    assertText(getByTestId('state'), 'sent');
    waitUntil(() => networkEntries({glob: '**/api/contacts/verify'}).length > 0, {timeoutMs: 5000});
    answers = networkEntries({glob: '**/api/contacts/verify', since: before});
    assertTrue(answers.length == 1, json(answers));
    answer = answers[0];
    assertTrue(answer.status == 200 && answer.ok, json(answer));
    assertTrue(answer.method == 'POST' && answer.mocked, json(answer));
    assertTrue(answer.responseJson.kind == 'mobile', json(answer));
    assertTrue(answer.requestJson.phone == '+15550100', json(answer));
    assertTrue(textContains(answer.responseText, 'country'), json(answer));
  });

  step("A refusal is an answer too: its status is the one the API gave", () => {
    click(getByRole('button', {name: 'Refuse'}));
    waitUntil(() => networkEntries({glob: '**/verify-code'}).length > 0, {timeoutMs: 5000});
    answer = networkEntries({glob: '**/verify-code'})[0];
    assertTrue(answer.status == 422 && !answer.ok, json(answer));
    assertTrue(answer.responseJson.error == 'bad code', json(answer));
    assertTrue(answer.requestJson == null, json(answer));
  });

  step("A page document is a status only, and another mask finds nothing", () => {
    answer = networkEntries({glob: 'https://verify-page.unotest.test/'})[0];
    assertTrue(answer.status == 200 && answer.responseText == null, json(answer));
    assertTrue(networkEntries({glob: '**/no-such-call'}).length == 0, 'a mask nothing matched');
    unmockRoute();
  });
}
