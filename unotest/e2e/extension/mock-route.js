// #327: an abort on `**/*` reaches web requests only, so the extension's
// own popup still runs its script; a mask that names the extension's
// scheme still cuts it. Runs only through `pnpm dogfood:extension`.

function test_extension_mock_route() {
  step("The worker stores a theme the popup script will show", () => {
    waitForServiceWorker({timeoutMs: 15000});
    id = extensionId();
    evaluateInServiceWorker('(theme) => chrome.storage.local.set({theme: theme})', 'sepia');
  });

  step("Under abort '**/*' the popup loads and its script runs", () => {
    mockRoute('**/*', {abort: true});
    goto('chrome-extension://' + id + '/popup.html');
    assertText(getByTestId('popup-theme'), 'sepia');
  });

  step("A mask with the extension's scheme cuts the popup script", () => {
    mockRoute('chrome-extension://' + id + '/popup.js', {abort: true});
    goto('chrome-extension://' + id + '/popup.html');
    assertText(getByTestId('popup-theme'), 'unset');
  });
}
