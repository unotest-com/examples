// HTTP primitives against the fixture API (fixtures.unotest.com, source in
// unotest/fixtures/api/). Every record carries a run-scoped marker and the
// scenario reads back only its own — the instance is shared and long-lived,
// so nothing here may assume an empty store.

function test_api_crud_round_trip() {
  step("Create an item under a run-scoped marker", () => {
    marker = randomWord(12);
    created = apiCall('POST', '/items', {marker: marker, name: 'dogfood widget', qty: 2});
    assertTrue(created.status == 201, 'create should answer 201');
    itemId = created.body.id;
    assertTrue(textContains(created.body.name, 'dogfood'), created.body.name);
  });

  step("Read it back by id and by marker", () => {
    fetched = apiCall('GET', '/items/' + itemId);
    assertTrue(fetched.status == 200, 'the created item should be readable');
    assertTrue(fetched.body.qty == 2, 'qty did not survive the round trip');

    mine = apiCall('GET', '/items?marker=' + marker);
    assertTrue(mine.body.count == 1, 'the marker must select exactly this run"s item');
  });

  step("Patch it, then delete it", () => {
    patched = apiCall('PATCH', '/items/' + itemId, {qty: 41});
    assertTrue(patched.status == 200, 'patch should answer 200');
    assertTrue(patched.body.qty == 41, 'patch did not land');

    removed = apiCall('DELETE', '/items/' + itemId);
    assertTrue(removed.status == 200, 'delete should answer 200');

    after = apiCall('GET', '/items?marker=' + marker);
    assertTrue(after.body.count == 0, 'the item survived the delete');
  });
}

function test_api_reports_status_and_headers() {
  step("A non-2xx status comes back as data, not as a thrown step", () => {
    teapot = apiCall('GET', '/status/418');
    assertTrue(teapot.status == 418, 'apiCall should surface the status verbatim');
  });

  step("Custom headers and the request body reach the server", () => {
    echoed = apiCall('POST', '/echo', {hello: 'dogfood'}, {'x-dogfood': 'yes'});
    assertTrue(echoed.status == 200, 'echo should answer 200');
    assertTrue(echoed.body.method == 'POST', echoed.body.method);
    headers = echoed.body.headers;
    assertTrue(headers['x-dogfood'] == 'yes', 'custom header was dropped');
    assertTrue(echoed.body.body.hello == 'dogfood', 'json body was not received intact');
  });
}

function test_api_multipart_upload() {
  step("upload() puts a real file on the wire", () => {
    res = apiCall('POST', '/upload', upload('sample.txt', {field: 'attachment'}));
    assertTrue(res.status == 201, 'upload should answer 201');
    files = res.body.files;
    assertTrue(files.length == 1, 'exactly one file part was expected');
    assertTrue(files[0].field == 'attachment', files[0].field);
    assertTrue(files[0].filename == 'sample.txt', files[0].filename);
    assertTrue(files[0].size > 0, 'the file part arrived empty');
  });

  step("PDF under the default part name, with extra form fields", () => {
    // The consumer shape (support-ai-assistant): a NestJS
    // FileInterceptor('file') endpoint — one part named `file`, correct
    // content type, extra fields riding in the same form.
    res = apiCall('POST', '/upload', upload('sample.pdf', {fields: {source: 'dogfood'}}),
      {'x-dogfood': 'yes'});
    assertTrue(res.status == 201, json(res.body));
    files = res.body.files;
    assertTrue(files.length == 1, json(files));
    assertTrue(files[0].field == 'file', files[0].field);
    assertTrue(files[0].filename == 'sample.pdf', files[0].filename);
    assertTrue(textContains(files[0].contentType, 'application/pdf'), files[0].contentType);
    assertTrue(files[0].size > 0, 'the pdf part arrived empty');
    assertTrue(res.body.fields.source == 'dogfood', json(res.body.fields));
  });
}
