// Red twins (#449) of upload()'s {field} and {fields}: the fixture API's
// /upload answers with the parts it received. The twin checks the form a
// plain upload() sends — one part named `file`, no extra fields — and the
// failure quotes what only the key put on the wire. The control reads the
// same answer for the key's own part name and field.

function test_upload_field_twin() {
  step("Twin: {field: 'attachment'} does not send the part as `file`", () => {
    assert_failed_with(caught_message(() => {
      const res = apiCall('POST', '/upload', upload('sample.txt', {field: 'attachment'}));
      assertEqual(res.body.files[0].field, 'file');
    }), 'got "attachment"');
  });

  step("Control: the part arrives under its field name", () => {
    const res = apiCall('POST', '/upload', upload('sample.txt', {field: 'attachment'}));
    assertEqual(res.body.files[0].field, 'attachment');
  });
}

function test_upload_fields_twin() {
  step("Twin: {fields} does not send the file alone", () => {
    assert_failed_with(caught_message(() => {
      const res = apiCall('POST', '/upload', upload('sample.txt', {fields: {source: 'dogfood'}}));
      assertEqual(res.body.fields, {});
    }), '"source"');
  });

  step("Control: the extra field rides in the same form", () => {
    const res = apiCall('POST', '/upload', upload('sample.txt', {fields: {source: 'dogfood'}}));
    assertEqual(res.body.fields, {source: 'dogfood'});
  });
}
