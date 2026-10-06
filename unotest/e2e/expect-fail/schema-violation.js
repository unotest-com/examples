// @expect-fail
// Deliberate failure: a message that breaks the schema in two fields must
// name both by path, not only say "invalid".

function test_schema_violation_names_the_fields() {
  step("Check a message that breaks its schema", () => {
    schema = readJson('unotest/fixtures/data/message.schema.json');
    assertSchema({room: 0, text: 'hello', tags: ['greeting', 'Draft']}, schema);
  });
}
