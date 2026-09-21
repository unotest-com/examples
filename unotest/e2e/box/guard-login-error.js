// id-box/guard-login-error
// Guard: credentials that are not accepted, and a refusal that says no more
// #4287f5
//
// After 2026-09-17 the suite signs in as the account the box ships with
// (`admin`). This scenario is about the WRONG PASSWORD of that account —
// the path a person actually takes — and about the refusal giving nothing
// else away: a name that exists and a name that does not are answered the
// same way, so the form cannot be used to find out who has an account here.
function test_guard_login_error() {
  step("A real account with the wrong password", () => {
    goto("/_guard/");
    fill(getByPlaceholder("username", {exact: true}), guard_admin_user());
    fill(getByPlaceholder("password", {exact: true}), "not-the-password");
    click(getByRole("button", {name: "Log in", exact: true}));
  });
  step("Login is refused", () => {
    assertText(getByText("Those credentials were not accepted.", {exact: true}), "Those credentials were not accepted.", {exact: true});
    // The provider's own label (static-users-provider.ts). "Break-glass"
    // is what we call this account among ourselves; the screen says "Box
    // account" since #88, because the metaphor means nothing to a person
    // opening their box for the first time.
    assertVisible(getByRole("button", {name: "Box account", exact: true}));
  });
  step("A name nobody has is refused in the same words", () => {
    goto("/_guard/");
    fill(getByPlaceholder("username", {exact: true}), "nobody-by-this-name");
    fill(getByPlaceholder("password", {exact: true}), "not-the-password");
    click(getByRole("button", {name: "Log in", exact: true}));
    assertText(getByText("Those credentials were not accepted.", {exact: true}), "Those credentials were not accepted.", {exact: true});
  });
}
