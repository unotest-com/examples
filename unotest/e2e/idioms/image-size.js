// Idiom: is the image loaded, and how big is it?
// Habit: evaluateOnLocator(img, '(img) => img.complete && img.naturalWidth').
// Typed step: getImageSize(locator) gives the natural {width, height}, or
// null for an image that did not load.

function image_page_url() {
  return 'data:text/html,<img alt="Logo" width="90" height="60" src="data:image/png;base64,' +
    'iVBORw0KGgoAAAANSUhEUgAAAAMAAAACCAIAAAASFvFNAAAAEElEQVR4nGP4z8AAQQxwFgBB0gX7h/C5SAAAAABJRU5ErkJggg==">';
}

function test_idiom_image_size() {
  step("Open a page with a 3x2 image drawn at 90x60", () => {
    goto(image_page_url());
    waitFor(getByAltText('Logo'));
  });

  step("The natural size, not the drawn one", () => {
    assertEqual(getImageSize(getByAltText('Logo')), {width: 3, height: 2});
  });
}
