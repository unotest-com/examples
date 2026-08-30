// id-box/ro-login
// box/ro-login
// #4287f5
function test_ro_login() {
  step("Sign in to the box as ro", () => {
    goto("https://dogfood.box.unotest.com/");
    fill(getByPlaceholder("username", {exact: true}), "ro");
    fill(getByPlaceholder("password", {exact: true}), BOX_RO_PASSWORD);
    click(getByRole("button", {name: "Log in", exact: true}));
  });
  step("Read-only user reaches the picker", () => {
    assertText(getByRole("heading", {name: "Environments", exact: true}), "Environments");
    assertVisible(getByRole("button", {name: "Open viewer", exact: true}));
  });
}
