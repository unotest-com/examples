// id-box/guard-env-values-secret-copy
// Guard: Values — Copy fetches a secret without showing it, audited
// #4287f5
//
// The clipboard content itself cannot be read back here (the runner's
// browser denies clipboard-write, the page falls back to execCommand), so
// the pinned contract is: the `copied` tag flashes, no error notice, the
// value never appears on the page, and the audit carries how=copy.
function test_guard_env_values_secret_copy() {
  step("Sign in as ivan", () => {
    flow_guard_login("ivan", BOX_LAB_PASSWORD);
  });
  step("Add a secret", () => {
    flow_guard_open_env_values("dogfood", "prod");
    name = "UT_COPY_" + randomWord(6);
    value = "s3cr3t-" + randomWord(8);
    guard_add_value(name, value, true);
    row = guard_value_row(name);
  });
  step("Copy without showing", () => {
    click(row.getByRole("button", {name: "Copy", exact: true}));
    assertVisible(row.locator("[data-copied]"));
    assertHidden(locator("[data-error]"));
    assertHidden(row.locator("[data-secret-value]"));
    assertHidden(getByText(value, {exact: true}));
  });
  step("Audit records the copy", () => {
    assertVisible(guard_audit_row("secret.revealed", name + " (copy)"));
  });
  step("Remove the secret", () => {
    flow_guard_open_env_values("dogfood", "prod");
    guard_remove_value(name);
  });
  step("Log out", () => {
    flow_guard_logout();
  });
}
