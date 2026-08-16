// Process primitives: shell() (execFile — no shell interpretation),
// waitForFile() for work a background process finishes later, and
// textContains() for reading stdout back. Files land under unotest/.tmp/,
// named with a run-scoped marker so parallel runs never collide.

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

function test_wait_for_file_picks_up_background_work() {
  step("Kick off a writer that finishes after a delay", () => {
    marker = randomWord(10);
    path = 'unotest/.tmp/' + marker + '.log';
    shell('node', '-e', 'const {mkdirSync,writeFileSync}=require("node:fs");mkdirSync("unotest/.tmp",{recursive:true});setTimeout(()=>writeFileSync(process.argv[1],"job done\\n"),300);', path, {timeoutMs: 5000});
  });

  step("waitForFile blocks until the content shows up", () => {
    content = waitForFile(path, 'job done', {timeoutMs: 5000});
    assertTrue(textContains(content, 'job done'), content);
  });

  step("Clean up after the run", () => {
    shell('node', '-e', 'require("node:fs").rmSync(process.argv[1], {force: true})', path);
    assertNoFile(path, {withinMs: 300});
  });
}
