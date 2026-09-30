// Reads both fields of the object it is given. The acceptance scenario
// compares the return value, so a field lost on the way fails the step.
function echo_object(h) {
  return "x=" + h.x + " y=" + h.y;
}

// Sign in to the support thread page of the fixture server
// (unotest/fixtures/api/support-thread.mjs). The session is a cookie, so
// every browser context signs in on its own — the #197 scenario relies on
// exactly that.
function flow_login(login, password) {
  goto('/support/login');
  fill(getByLabel('Login'), login);
  fill(getByLabel('Password'), password);
  click(getByRole('button', {name: 'Sign in'}));
  waitForText('Signed in as');
}
