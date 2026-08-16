// Protected dashboard: fake login with credentials from
// unotest/.secrets. The values must resolve for the live run but never
// appear in logs or artifacts (SecretRegistry masking).

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
