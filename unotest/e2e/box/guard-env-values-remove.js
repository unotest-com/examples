// id-box/guard-env-values-remove
// Guard: Values — remove a box variable, audited
// #4287f5
function test_guard_env_values_remove() {
  step("Sign in as ivan", () => {
    flow_guard_login("ivan", BOX_LAB_PASSWORD);
  });
  step("Add a variable", () => {
    flow_guard_open_env_values("dogfood", "prod");
    name = "UT_RM_" + randomWord(6);
    guard_add_value(name, "gone-soon", false);
  });
  step("Remove it (confirm is auto-accepted)", () => {
    guard_remove_value(name);
    reload();
    assertCount(guard_value_row(name), 0);
  });
  step("Audit records the removal", () => {
    assertVisible(guard_audit_row("env.value.removed", name));
  });
  step("Log out", () => {
    flow_guard_logout();
  });
}
