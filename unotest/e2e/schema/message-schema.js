// The message a page sends, checked against the JSON Schema the app would
// generate from its own zod schema (unotest/fixtures/data/message.schema.json)
// instead of field-by-field asserts that drift from the contract. The page
// lives on an origin nobody serves: mockRoute answers it and its API.

function schema_page_html() {
  return '<p data-testid="sent">-</p><button id="send">Send</button>' +
    '<script>' +
    'document.getElementById("send").onclick = () => fetch("/api/messages", {method: "POST",' +
    ' headers: {"content-type": "application/json"},' +
    ' body: JSON.stringify({room: 7, text: "hello", tags: ["greeting", "draft"]})})' +
    '.then((r) => r.text()).then((t) => { document.querySelector("[data-testid=sent]").textContent = t; });' +
    '</script>';
}

function test_message_matches_its_schema() {
  step("The page sends a message", () => {
    site = 'https://schema-page.unotest.test/';
    mockRoute(site, {body: schema_page_html(), contentType: 'text/html'});
    mockRoute('**/api/messages', {body: 'stored'});
    goto(site);
    click(getByRole('button', {name: 'Send'}));
    assertText(getByTestId('sent'), 'stored');
  });

  step("What it sent conforms to the message schema", () => {
    schema = readJson('unotest/fixtures/data/message.schema.json');
    req = waitForRequest('**/api/messages', {timeoutMs: 5000});
    assertSchema(req.postDataJson, schema);
    unmockRoute();
  });
}
