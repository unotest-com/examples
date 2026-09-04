// Protected dashboard: fake login with the public demo credentials from
// unotest/.env. Nothing to mask here — the values are hardcoded in the
// playground; what this scenario owns is that they resolve and the
// session survives a sign-out.

function test_login_reaches_the_dashboard() {
  step("Sign in with the demo credentials", () => {
    flow_signin();
  });

  step("The overview page is visible for the signed-in session", () => {
    assertVisible(getByRole('heading', {name: 'Overview'}));
    assertUrl('/dashboard');
  });

  step("Sign out returns to the public site", () => {
    // Two sign-out controls exist (header icon + sidebar); pin the
    // sidebar one via its enclosing complementary landmark.
    click(getByRole('complementary').getByRole('button', {name: 'Sign out'}));
    waitForUrl('/login');
  });
}
