// A test that checks a file the app produced: its text, its first bytes,
// an image's dimensions. The fixtures stand in for app output, and the
// last step reads a real download by the absolute path waitForDownload
// returns. The values asserted are the fixtures' own, so a wrong path, a
// wrong encoding or width and height swapped fail the step.

function test_read_file_files() {
  step("Text is read as written", () => {
    text = readFile('unotest/fixtures/files/sample.txt');
    assertTrue(textContains(text, 'plain text payload'), text);
  });

  step("Bytes come as base64 and start with the PNG signature", () => {
    bytes = readFile('unotest/fixtures/files/image-3x2.png', {encoding: 'base64'});
    assertTrue(textContains(bytes, 'iVBORw0KGgo'), bytes);
  });

  step("A PNG reports its size and dimensions", () => {
    info = readFileInfo('unotest/fixtures/files/image-3x2.png');
    assertTrue(info.size == 73, json(info));
    assertTrue(info.png.width == 3 && info.png.height == 2, json(info));
  });

  step("A file that is not a PNG has no png field", () => {
    info = readFileInfo('unotest/fixtures/files/sample.pdf');
    assertTrue(info.size > 0 && info.png == null, json(info));
  });

  step("A downloaded PNG is read by the path the download reported", () => {
    goto('/scenarios/clicks');
    waitFor(getByRole('button', {name: 'Open popup'}));
    evaluate("(b64) => { const a = document.createElement('a'); a.download = 'chart.png'; a.href = 'data:image/png;base64,' + b64; a.textContent = 'Save chart'; document.body.append(a); }", bytes); // lint-ok: the playground has no image download, so the scenario adds one from the fixture
    click(getByText('Save chart'));
    file = waitForDownload();
    info = readFileInfo(file.path);
    assertTrue(info.png.width == 3 && info.png.height == 2, json(info));
  });
}
