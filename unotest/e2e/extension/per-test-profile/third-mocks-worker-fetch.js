// #295: the last of the per-test-profile collection. A mock answers the
// worker's own fetch only on a profile the browser opens for the first time;
// on a shared profile opened before (the control) Playwright does not route
// it (#288).

function test_third_mocks_the_worker_fetch() {
  step("A mock answers the fetch the worker makes itself", () => {
    mockRoute('https://api.unotest.test/room/last-message/load', {body: {text: 'Hello from the mock'}});
    waitForServiceWorker({timeoutMs: 15000});
    reply = evaluateInServiceWorker('(room) => self.loadLastMessage(room)', 7);
    assertTrue(reply.text == 'Hello from the mock', 'worker got: ' + json(reply));
    unmockRoute();
  });
}
