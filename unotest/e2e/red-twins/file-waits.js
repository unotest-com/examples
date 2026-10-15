// Red twins (#449) of the file readers' options: a wait called for what
// never comes must fail by its own timeoutMs, well before the default; a
// reader's option must change what comes back. The same call on the right
// state passes next to each. Files land under the suite's scratch
// directory with a run-scoped marker; downloads come from a mocked page.

function write_lines(path) {
  shell('node', '-e', 'const fs=require("node:fs");fs.writeFileSync(process.argv[1],JSON.stringify({userId:"human",text:"present"})+"\\n");', path, {timeoutMs: 5000});
}

function test_file_wait_twins() {
  let path;
  step("A writer leaves one human line", () => {
    path = scratch_path('twins-' + randomWord(10) + '.jsonl');
    write_lines(path);
  });

  step("waitForFile timeoutMs: text that never comes fails in time, text that is there passes", () => {
    const started = nowMs();
    assert_failed_with(caught_message(() => waitForFile(path, 'absent', {timeoutMs: 300})), 'waitForFile');
    assert_failed_in_time(started, 'waitForFile');
    waitForFile(path, 'present', {timeoutMs: 300});
  });

  step("waitForFileCount timeoutMs: a second line that never comes fails in time, one passes", () => {
    const started = nowMs();
    assert_failed_with(caught_message(() => waitForFileCount(path, {userId: 'human'}, 2, {timeoutMs: 300})), 'waitForFileCount');
    assert_failed_in_time(started, 'waitForFileCount');
    waitForFileCount(path, {userId: 'human'}, 1, {timeoutMs: 300});
  });

  step("waitForJsonLine timeoutMs: a line that never comes fails in time, the one there passes", () => {
    const started = nowMs();
    assert_failed_with(caught_message(() => waitForJsonLine(path, {userId: 'nobody'}, {timeoutMs: 300})), 'waitForJsonLine');
    assert_failed_in_time(started, 'waitForJsonLine');
    waitForJsonLine(path, {userId: 'human'}, {timeoutMs: 300});
  });
}

function test_read_file_twins() {
  step("encoding: base64 hands back the bytes encoded, not the text", () => {
    assert_failed_with(caught_message(() => assertEqual(textMatches(readFile('unotest/e2e/red-twins/file-waits.js', {encoding: 'base64'}), /^.{8}/)[0], '// Red t')), '"Ly8gUmVk"');
    assertEqual(textMatches(readFile('unotest/e2e/red-twins/file-waits.js', {encoding: 'base64'}), /^.{8}/)[0], 'Ly8gUmVk');
    assertEqual(textMatches(readFile('unotest/e2e/red-twins/file-waits.js', {encoding: 'utf8'}), /^.{8}/)[0], '// Red t');
  });
}

function download_page() {
  return '<a download="server.log" href="data:text/plain,boot%20ok">Save server.log</a>' +
    '<a download="report.csv" href="data:text/plain,id%2Ctotal">Save report.csv</a>';
}

function test_download_twins() {
  step("Open a page with two download links", () => {
    mockRoute('**/twin-downloads', {contentType: 'text/html', body: download_page()});
    goto('/twin-downloads');
  });

  step("timeoutMs: no download fails in its own time and says so", () => {
    const started = nowMs();
    assert_failed_with(caught_message(() => waitForDownload({timeoutMs: 300})), 'no download within 300 ms');
    assert_failed_in_time(started, 'waitForDownload');
  });

  step("name: a download of another name is not taken, its own name is", () => {
    click(getByText('Save server.log'));
    assert_failed_with(caught_message(() => waitForDownload({name: /\.csv$/, timeoutMs: 300})), 'server.log');
    assertEqual(waitForDownload({name: 'server.log', timeoutMs: 3000}).name, 'server.log');
  });
}
