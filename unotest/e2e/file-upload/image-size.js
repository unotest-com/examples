// getImageSize (#379): the natural size of an <img>, read without
// evaluateOnLocator. The image is our own 3x2 PNG, uploaded and shown in
// the preview dialog, so the numbers are known before the run. The same
// numbers read through evaluateOnLocator are the control: both have to
// agree on one element in one run.
//
// Not covered here: a broken image → null. The playground has no broken
// <img> to point at.

function test_image_size_of_an_uploaded_preview() {
  let size;
  let raw;
  let loaded;
  step("Upload a 3x2 PNG and open its preview", () => {
    goto('/scenarios/file-upload?chunks=2&delayMs=40');
    uploadFile(locator('input[type=file]'), 'unotest/fixtures/files/image-3x2.png');
    waitForText('1 of 1 done');
    click(getByTitle('Preview'));
    waitFor(getByAltText('Preview of image-3x2.png'));
  });

  step("getImageSize reads the natural size, not the rendered one", () => {
    size = getImageSize(getByAltText('Preview of image-3x2.png'));
    assertEqual(size, {width: 3, height: 2});
  });

  step("evaluateOnLocator reads the same numbers off the same element", () => {
    raw = evaluateOnLocator(getByAltText('Preview of image-3x2.png'), '(img) => ({width: img.naturalWidth, height: img.naturalHeight})'); // lint-ok: the control the typed getter replaces
    assertEqual(raw, size);
  });

  step("The image really loaded: it has pixels", () => {
    loaded = getImageSize(getByAltText('Preview of image-3x2.png'));
    assertTrue(loaded != null && loaded.width > 0 && loaded.height > 0, json(loaded));
  });
}
