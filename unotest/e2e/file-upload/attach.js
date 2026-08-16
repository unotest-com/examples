// File input: uploadFile() must reach an input the page keeps visually
// hidden (sr-only) and drives through a click handler. Uploads are mocked by
// a service worker in chunks, so the queue reports progress before it
// reports "done" — a fresh assertion, not a snapshot, has to wait it out.

function test_single_file_upload() {
  step("Open the upload scenario with fast chunks", () => {
    goto('/scenarios/file-upload?chunks=2&delayMs=40');
    waitFor(getByRole('button', {name: 'File drop zone — accepts any file'}));
  });

  step("Attach one file to the hidden input", () => {
    uploadFile(locator('input[type=file]'), 'unotest/fixtures/files/sample.txt');
    assertVisible(getByText('sample.txt'));
  });

  step("The queue reports it finished", () => {
    waitForText('1 of 1 done');
    assertVisible(getByRole('progressbar', {name: 'Upload progress of sample.txt'}));
  });
}

function test_multi_file_upload() {
  step("Open the upload scenario with fast chunks", () => {
    goto('/scenarios/file-upload?chunks=2&delayMs=40');
    waitFor(getByRole('button', {name: 'File drop zone — accepts any file'}));
  });

  step("Attach two files at once", () => {
    uploadFile(locator('input[type=file]'), [
      'unotest/fixtures/files/sample.txt',
      'unotest/fixtures/files/widgets.csv',
    ]);
    // At-least semantics: the queue is still filling in as we look at it.
    waitForCount(getByRole('status').getByRole('listitem'), 2);
    assertCount(getByRole('status').getByRole('listitem'), 2);
  });

  step("Both land in the queue", () => {
    waitForText('2 of 2 done');
    assertVisible(getByText('widgets.csv'));
  });
}
