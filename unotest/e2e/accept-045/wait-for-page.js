// Acceptance #291: tabs that opened BEFORE the call are still handed over,
// one per call, in order — the pilot clicks, and only then asks
// (demo-kit e2e/helpers/stage.ts waits with Promise.all, unotest cannot).
// The extension-opened tab (chrome.tabs.create from a service worker) is
// checked outside the dogfood: its extension fixture has no worker.

function test_wait_for_page_hands_over_earlier_tabs() {
  step("Open the clicks scenario", () => {
    goto('/scenarios/clicks');
    waitFor(getByRole('button', {name: 'Open popup'}));
  });

  step("Two popups open before anyone waits", () => {
    click(getByRole('button', {name: 'Open popup'}));
    setPage(0);
    click(getByRole('button', {name: 'Open popup'}));
    setPage(0);
  });

  step("Each waitForPage hands over the next one", () => {
    first = waitForPage({timeoutMs: 5000});
    waitForText('Popup opened via');
    second = waitForPage({timeoutMs: 5000});
    waitForText('Popup opened via');
    assertTrue(first == 1 && second == 2, 'handed over: ' + first + ', ' + second);
  });
}
