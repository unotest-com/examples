// #295: `launch.profile: "per-test"` — every test_* starts a new browser on
// a new profile, the extension loaded again and its service worker started
// from scratch. One of three files run in order by the per-test-profile
// collection, only through `pnpm dogfood:extension`: on per-test (green),
// and as the control on one shared profile (UNOTEST_USER_DATA_DIR), where
// the second and third files must fail. This one leaves the storage behind.

function test_first_leaves_extension_storage() {
  step("The extension stores a value through its worker", () => {
    waitForServiceWorker({timeoutMs: 15000});
    evaluateInServiceWorker('(v) => chrome.storage.local.set({left: v})', 'by the first test');
    stored = evaluateInServiceWorker('() => chrome.storage.local.get("left")');
    assertTrue(stored.left == 'by the first test', 'stored: ' + json(stored));
  });
}
