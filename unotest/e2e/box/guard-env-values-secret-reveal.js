// id-box/guard-env-values-secret-reveal
// Guard: Values — reveal a secret with the eye, audited
// #4287f5
//
// Steps were exercised live through explore_steps; written by hand because
// the recorder cannot render css+role chains.
function test_guard_env_values_secret_reveal() {
  step("Sign in as ivan", () => {
    flow_guard_login("ivan", BOX_LAB_PASSWORD);
  });
  step("Add a secret", () => {
    flow_guard_open_env_values("dogfood", "prod");
    name = "UT_SECRET_" + randomWord(6);
    value = "s3cr3t-" + randomWord(8);
    guard_add_value(name, value, true);
    row = guard_value_row(name);
    assertText(row.getByText("secret", {exact: true}), "secret", {exact: true});
    assertText(row.locator("[data-text]"), "••••••••", {exact: true});
    assertHidden(getByText(value, {exact: true}));
  });
  step("Reveal with the eye", () => {
    click(row.getByRole("button", {name: "Reveal", exact: true}));
    assertText(row.locator("[data-secret-value]"), value, {exact: true});
    assertVisible(row.getByRole("button", {name: "Hide", exact: true}));
    click(row.getByRole("button", {name: "Hide", exact: true}));
    assertHidden(row.locator("[data-secret-value]"));
  });
  step("Audit records the reveal", () => {
    assertVisible(guard_audit_row("secret.revealed", name + " (show)"));
  });
  step("Remove the secret", () => {
    flow_guard_open_env_values("dogfood", "prod");
    guard_remove_value(name);
  });
  step("Log out", () => {
    flow_guard_logout();
  });
}
