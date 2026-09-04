// Sign in to the playground's fake-login dashboard. Credentials come
// from unotest/.env (LOGIN / PASSWORD): they are public — hardcoded in
// the playground itself — and as secrets their values were substring-
// masked into every artifact that happened to contain them. The masking
// machinery is exercised by MASKING_PROBE (misc/secret-masking) instead.
function flow_signin() {
  goto('/login');
  fill(getByLabel('Username'), LOGIN);
  fill(getByLabel('Password'), PASSWORD);
  click(getByRole('button', {name: 'Sign in'}));
  waitForUrl('/dashboard');
}
