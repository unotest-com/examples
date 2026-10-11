// @expect-fail
// getImageSize on an element that is not an <img> (#379): refused with
// the tag it found, not a silent null that reads as "broken image".

function test_image_size_of_a_button() {
  step("Open the upload scenario", () => {
    goto('/scenarios/file-upload');
    waitFor(getByRole('button', {name: 'File drop zone — accepts any file'}));
  });

  step("Ask a button for its image size", () => {
    getImageSize(getByRole('button', {name: 'reset'}));
  });
}
