// id-box/guard-env-values-inline-edit
// Guard: Values — add a variable, edit it inline, cancel with Esc
// #4287f5
//
// Steps were exercised live through explore_steps; written by hand because
// the recorder cannot render css+role chains. The variable name carries a
// random marker so parallel runs never touch each other's rows.
function test_guard_env_values_inline_edit() {
  step("Sign in as ivan", () => {
    flow_guard_login("ivan", BOX_LAB_PASSWORD);
  });
  step("Add a variable", () => {
    flow_guard_open_env_values("dogfood", "prod");
    name = "UT_EDIT_" + randomWord(6);
    guard_add_value(name, "v1", false);
    row = guard_value_row(name);
    assertText(row.locator("[data-text]"), "v1", {exact: true});
    assertText(row.getByText("box", {exact: true}), "box", {exact: true});
    assertVisible(row.getByRole("button", {name: "Remove", exact: true}));
  });
  step("Edit the value inline", () => {
    click(row.getByRole("button", {name: "Edit", exact: true}));
    assertVisible(row.getByLabel("Value", {exact: true}));
    fill(row.getByLabel("Value", {exact: true}), "v2");
    press(row.getByLabel("Value", {exact: true}), "Enter");
    assertText(row.locator("[data-text]"), "v2", {exact: true});
    reload();
    assertText(row.locator("[data-text]"), "v2", {exact: true});
  });
  step("Escape cancels an edit", () => {
    click(row.getByRole("button", {name: "Edit", exact: true}));
    fill(row.getByLabel("Value", {exact: true}), "v3");
    press(row.getByLabel("Value", {exact: true}), "Escape");
    assertHidden(row.getByLabel("Value", {exact: true}));
    assertText(row.locator("[data-text]"), "v2", {exact: true});
  });
  step("Remove the variable", () => {
    guard_remove_value(name);
  });
  step("Log out", () => {
    flow_guard_logout();
  });
}
