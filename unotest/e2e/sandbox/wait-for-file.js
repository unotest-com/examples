// waitForFile() for work a background process finishes later. Files land
// under unotest/.tmp/, named with a run-scoped marker so parallel runs
// never collide.

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
