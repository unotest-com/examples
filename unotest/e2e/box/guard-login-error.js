// id-box/guard-login-error
// Guard: a wrong password is refused on the break-glass form
// #4287f5
function test_guard_login_error() {
  step("Try a wrong password", () => {
    goto("/_guard/");
    fill(getByPlaceholder("username", {exact: true}), "ivan");
    fill(getByPlaceholder("password", {exact: true}), "not-the-password");
    click(getByRole("button", {name: "Log in", exact: true}));
  });
  step("Login is refused", () => {
    assertText(getByText("Those credentials were not accepted.", {exact: true}), "Those credentials were not accepted.", {exact: true});
    assertVisible(getByRole("button", {name: "Break-glass account", exact: true}));
  });
}
