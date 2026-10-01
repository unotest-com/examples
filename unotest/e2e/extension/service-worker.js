// #288: the extension's service worker — its id, chrome.storage through it,
// and the popup that reads what it stored. Runs only through
// `pnpm dogfood:extension`, like extension/marker: a browser without the
// extension has no worker. A mock of the worker's own fetch is not here:
// this collection shares one profile between scenarios, and on a profile
// opened before Playwright does not route the worker's requests (#288).

function test_extension_service_worker() {
  step("The extension's worker runs, and its URL names the extension", () => {
    sw = waitForServiceWorker({timeoutMs: 15000});
    id = extensionId();
    assertTrue(textContains(sw, 'chrome-extension://' + id + '/'), 'worker: ' + sw);
  });

  step("chrome.storage through the worker", () => {
    evaluateInServiceWorker('(theme) => chrome.storage.local.set({theme: theme})', 'dark');
    stored = evaluateInServiceWorker('() => chrome.storage.local.get("theme")');
    assertTrue(stored.theme == 'dark', 'stored: ' + json(stored));
  });

  step("The popup shows what the worker stored", () => {
    goto('chrome-extension://' + id + '/popup.html');
    assertText(getByTestId('popup-theme'), 'dark');
  });
}
