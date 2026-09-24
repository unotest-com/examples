// The extension fixture (unotest/fixtures/extension) appends one marker
// node to every playground page. Shared by the scenario that runs WITH the
// extension (pnpm dogfood:extension) and its control that runs without it
// (expect-fail/extension-absent), so the two cannot drift apart.
function flow_open_hub() {
  goto('/');
  waitForText('Stress-test browser');
}

function flow_assert_extension_marker() {
  assertVisible(getByTestId('unotest-extension-marker'));
}
