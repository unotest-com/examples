// Two clients of one app: a browser context of their own each — separate
// cookies, storage and tabs. Client A signs in; client B, opened beside it
// with newContext(), is nobody to the app; back in A the session and the
// page are where A left them.

function test_two_clients_do_not_share_a_session() {
  step("Client A signs in", () => {
    flow_signin();
    assertUrl('/dashboard');
  });

  step("Client B is a stranger to the app", () => {
    clientB = newContext();
    goto('/dashboard');
    waitForUrl('/login');
  });

  step("Back to client A — still signed in, on the same page", () => {
    setContext(0);
    assertUrl('/dashboard');
    reload();
    assertUrl('/dashboard');
  });

  step("And B is still where it was", () => {
    setContext(clientB);
    assertUrl('/login');
  });
}
