// Acceptance 0.44, #198 criterion 4: an object literal lives in a
// variable and reaches a helper intact.

function test_object_literal_to_helper() {
  step("Object literal in a variable goes into a helper", () => {
    h = {x: 1, y: "z"};
    got = echo_object(h);
    assertTrue(got === "x=1 y=z", 'helper should see both fields');
  });
}
