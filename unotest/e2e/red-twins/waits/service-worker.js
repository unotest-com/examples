// Red twins (#449) of waitForServiceWorker's {url} and {timeoutMs}. Runs
// only in the `extension` collection (`pnpm dogfood:extension`): a browser
// without the extension has no worker, and the call refuses at once. The
// extension's worker is running, so only {url} can make the wait miss it:
// the twin names a worker that never starts and fails naming that URL and
// its own window, well before the wait's default. The control finds the
// extension's worker by its URL.

function test_wait_for_service_worker_twins() {
  step("Twin: {url} of a worker that never starts fails within its timeoutMs", () => {
    const started = nowMs();
    const message = caught_message(() => waitForServiceWorker({url: 'no-such-worker', timeoutMs: 300}));
    const took = nowMs() - started;
    assert_failed_with(message, 'no service worker matching "no-such-worker" started within 300 ms');
    assertTrue(took < 3000, 'waitForServiceWorker failed after ' + took + ' ms, its timeoutMs is not honoured');
  });

  step("Control: {url} of the extension's worker finds it", () => {
    const worker = waitForServiceWorker({url: 'chrome-extension://', timeoutMs: 15000});
    assertTrue(textContains(worker, 'chrome-extension://'), 'worker: ' + worker);
  });
}
