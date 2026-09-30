// Acceptance 0.44, #198 criterion 3: index into a field without an
// intermediate variable.

function test_field_index() {
  step("Index a field of an object literal directly", () => {
    a = {b: [{c: 1}, {c: 2}]};
    assertTrue(a.b[0].c === 1, 'a.b[0].c should be 1');
    assertTrue(a.b[1].c === 2, 'a.b[1].c should be 2');
  });
}
