// Acceptance 0.44, #198 criterion 1: a string knows its length, so a
// "no longer than N" check needs no regex filter on a locator.

function test_string_length() {
  step("Length of a string literal held in a variable", () => {
    s = "abcdef";
    assertTrue(s.length === 6, 's.length should be 6');
  });
}
