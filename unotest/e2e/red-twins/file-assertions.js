// Red twins (#449) of the file oracles and their options: a writer leaves
// a small log behind, each check is called where it must fail and the
// message must name it; the same call on the right state passes next to it.
// Files land under the suite's scratch directory with a run-scoped marker.

function write_log(path) {
  shell('node', '-e', 'const fs=require("node:fs");fs.writeFileSync(process.argv[1],JSON.stringify({userId:"human",text:"present"})+"\\n");', path, {timeoutMs: 5000});
}

function test_line_oracle_twins() {
  let path;
  step("A writer leaves one human line", () => {
    path = scratch_path('twins-' + randomWord(10) + '.jsonl');
    write_log(path);
  });

  step("assertFileCount fails on a wrong number of lines", () => {
    assert_failed_with(caught_message(() => assertFileCount(path, {userId: 'human'}, 2)), 'assertFileCount');
    assertFileCount(path, {userId: 'human'}, 1);
  });

  step("assertNoJsonLine fails on a line that is there, within its window", () => {
    assert_failed_with(caught_message(() => assertNoJsonLine(path, {userId: 'human'}, {withinMs: 300})), 'assertNoJsonLine');
    assertNoJsonLine(path, {userId: 'nobody'}, {withinMs: 300});
  });

  step("assertNoFile fails on a file with a matching line, within its window", () => {
    assert_failed_with(caught_message(() => assertNoFile(path, 'human', {withinMs: 300})), 'assertNoFile');
    assertNoFile(path, 'nobody', {withinMs: 300});
  });
}

function test_search_twins() {
  let path;
  step("A writer leaves one human line", () => {
    path = scratch_path('twins-' + randomWord(10) + '.jsonl');
    write_log(path);
  });

  step("assertFileHas fails on bytes that are not there, within its timeout", () => {
    const started = nowMs();
    assert_failed_with(caught_message(() => assertFileHas(path, 'absent-needle', {timeoutMs: 300})), 'assertFileHas');
    const took = nowMs() - started;
    assertTrue(took < 5000, 'assertFileHas failed after ' + took + ' ms, its timeoutMs is not honoured');
    assertFileHas(path, 'present', {timeoutMs: 300});
  });

  step("assertFileLacks fails on bytes that are there", () => {
    assert_failed_with(caught_message(() => assertFileLacks(path, 'present')), 'assertFileLacks');
    assertFileLacks(path, 'absent-needle');
  });

  step("withinMs: a line written during the window fails it", () => {
    // shell() waits for its process: a detached child writes after it returns.
    shell('node', '-e', 'require("node:child_process").spawn(process.execPath,["-e","setTimeout(()=>require(\\"node:fs\\").appendFileSync(process.argv[1],\\"late\\\\n\\"),300)",process.argv[1]],{detached:true,stdio:"ignore"}).unref()', path, {timeoutMs: 5000});
    // Without the window one search, before the write, passes.
    assertFileLacks(path, 'late');
    assert_failed_with(caught_message(() => assertFileLacks(path, 'late', {withinMs: 2000})), 'assertFileLacks');
    assertFileLacks(path, 'never-written', {withinMs: 300});
  });
}
