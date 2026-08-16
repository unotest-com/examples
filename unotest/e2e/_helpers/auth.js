// Sign in to the playground's fake-login dashboard. Credentials come
// from unotest/.secrets (LOGIN / PASSWORD) — public demo values, kept
// as secrets so every run exercises the masking machinery.
function flow_signin() {
  goto('/login');
  fill(getByLabel('Username'), LOGIN);
  fill(getByLabel('Password'), PASSWORD);
  click(getByRole('button', {name: 'Sign in'}));
  waitForUrl('/dashboard');
}
