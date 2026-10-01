// A file the page downloads, taken after the click that started it:
// waitForDownload() hands over the saved file, waitForFile reads it by the
// absolute path it returns, and {name} picks one of two downloads.

function test_wait_for_download_saves_the_file() {
  step("Open a page and give it two download links", () => {
    goto('/scenarios/clicks');
    waitFor(getByRole('button', {name: 'Open popup'}));
    evaluate("() => { for (const [name, body] of [['server.log', 'boot ok'], ['report.csv', 'id,total\\n1,10']]) { const a = document.createElement('a'); a.download = name; a.href = 'data:text/plain,' + encodeURIComponent(body); a.textContent = 'Save ' + name; document.body.append(a); } }"); // lint-ok: the playground has no download link, so the scenario adds two
  });

  step("Click, then take the download and read it", () => {
    click(getByText('Save report.csv'));
    file = waitForDownload();
    assertTrue(file.name == 'report.csv', 'the suggested name comes through');
    waitForFile(file.path, 'id,total');
  });

  step("With two downloads waiting, {name} picks the one asked for", () => {
    click(getByText('Save server.log'));
    click(getByText('Save report.csv'));
    csv = waitForDownload({name: /\.csv$/});
    waitForFile(csv.path, '1,10');
    serverLog = waitForDownload({timeoutMs: 5000});
    assertTrue(serverLog.name == 'server.log', 'the log is left for the next call');
    waitForFile(serverLog.path, 'boot ok');
  });
}
