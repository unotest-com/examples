// Process primitives: shell() (execFile — no shell interpretation) and
// textContains() for reading stdout back. Background work is
// sandbox/wait-for-file.

function test_shell_reads_stdout_and_exit_codes() {
  step("A successful command hands back stdout", () => {
    out = shell('node', '-e', 'process.stdout.write("ready:" + process.argv[1])', 'dogfood');
    assertTrue(out.code == 0, out.stderr);
    assertTrue(textContains(out.stdout, 'ready:dogfood'), out.stdout);
  });

  step("Arguments are passed verbatim, not through a shell", () => {
    // A shell would expand this; execFile hands it over as one argument.
    out = shell('node', '-e', 'process.stdout.write(process.argv[1])', '$HOME && rm -rf /');
    assertTrue(textContains(out.stdout, '$HOME'), out.stdout);
  });

  step("A non-zero exit needs an explicit opt-in", () => {
    out = shell('node', '-e', 'process.stderr.write("nope"); process.exit(3)', {allowNonZero: true});
    assertTrue(out.code == 3, 'the exit code should reach the scenario');
    assertTrue(textContains(out.stderr, 'nope'), out.stderr);
  });
}
