// Acceptance 0.44, #198 criterion 2: trim, includes and startsWith work
// both inside an assertion and as the condition of an if.

function test_string_methods() {
  step("Methods inside assertions", () => {
    s = "  abcdef  ";
    assertTrue(s.trim() === "abcdef", 'trim should drop the outer spaces');
    assertTrue(s.includes("cd"), 'includes should find "cd"');
    assertTrue(s.trim().startsWith("ab"), 'startsWith should see "ab"');
    assertTrue(s.startsWith("ab") === false, 'startsWith must not skip leading spaces');
  });

  step("Methods as conditions", () => {
    s = "abcdef";
    hits = 0;
    if (s.includes("cd")) { hits = hits + 1; }
    if (s.startsWith("ab")) { hits = hits + 1; }
    if (s.trim() === s) { hits = hits + 1; }
    if (s.includes("zz")) { hits = hits + 100; }
    assertTrue(hits === 3, 'three true conditions and one false');
  });
}
