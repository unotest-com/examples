// id-box/guard-var-literal
// Guard: a page literal that equals a variable name stays a literal
// #4287f5
//
// Tooling regression (plan unotest-tooling-after-guard-acceptance, B2):
// the Values page shows a key literally named BOX_LAB_PASSWORD — the same
// spelling as a secret in .secrets. In the DSL a quoted string is a
// string, so this file is green; the explore layer used to turn the same
// literal into the secret's value (assertText expected "lab").
function test_guard_var_literal() {
  step("Sign in as ivan", () => {
    flow_guard_login("ivan", BOX_LAB_PASSWORD);
  });
  step("A key named like a variable", () => {
    flow_guard_open_env_values("dogfood", "prod");
    assertVisible(getByText("BOX_LAB_PASSWORD", {exact: true}));
    assertText(guard_value_row("BOX_LAB_PASSWORD").locator("code"), "BOX_LAB_PASSWORD", {exact: true});
    assertVisible(guard_value_row("BOX_LAB_PASSWORD").getByRole("button", {name: "Reveal", exact: true}));
  });
  step("Log out", () => {
    flow_guard_logout();
  });
}
