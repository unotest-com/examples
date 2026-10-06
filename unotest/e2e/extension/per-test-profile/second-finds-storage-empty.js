// #295: runs after extension/per-test-profile/first-leaves-storage in the
// per-test-profile collection. On its own profile the storage the first
// test left is not there; on a shared one (the control) it is.

function test_second_finds_extension_storage_empty() {
  step("The next test's extension storage is empty", () => {
    waitForServiceWorker({timeoutMs: 15000});
    stored = evaluateInServiceWorker('() => chrome.storage.local.get("left")');
    assertTrue(json(stored) == '{}', 'left by an earlier test: ' + json(stored));
  });
}
