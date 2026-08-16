// Always red, always offline — the run whose failure tab, screenshot and
// page.html the viewer e2e scenarios open.

function test_missing_element_fails() {
  step("Open a blank page", () => {
    goto('about:blank');
  });

  step("Wait for something that will never exist", () => {
    waitFor(getByRole('button', {name: 'Nothing here'}), {timeout: 1200});
  });
}
