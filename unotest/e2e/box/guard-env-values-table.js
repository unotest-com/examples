// id-box/guard-env-values-table
// Guard: Values page — one table with Key, Value, Source
// #4287f5
//
// Every locator below was exercised live through explore_steps; the
// recorder cannot render css+role chains, so the file is written by hand.
function test_guard_env_values_table() {
  step("Sign in as ivan", () => {
    flow_guard_login("ivan", BOX_LAB_PASSWORD);
  });
  step("Open Values of dogfood/prod", () => {
    flow_guard_open_env_values("dogfood", "prod");
  });
  step("One Values table", () => {
    assertVisible(getByRole("columnheader", {name: "Key", exact: true}));
    assertVisible(getByRole("columnheader", {name: "Value", exact: true}));
    assertVisible(getByRole("columnheader", {name: "Source", exact: true}));
    assertVisible(getByRole("switch", {name: "JSON", exact: true}));
  });
  step("Target row comes from the configuration", () => {
    target = guard_value_row("APP_BASE_URL");
    assertText(target.getByText("target", {exact: true}), "target", {exact: true});
    assertText(target.getByText("config", {exact: true}), "config", {exact: true});
    assertVisible(target.getByRole("button", {name: "Edit", exact: true}));
    assertCount(target.getByRole("button", {name: "Remove", exact: true}), 0);
    assertCount(guard_value_row("CATALOG_SEED").getByRole("button", {name: "Remove", exact: true}), 0);
  });
  step("Secret row is masked", () => {
    secret = guard_value_row("BOX_LAB_PASSWORD");
    assertText(secret.getByText("secret", {exact: true}), "secret", {exact: true});
    assertText(secret.locator("[data-text]"), "••••••••", {exact: true});
    assertHidden(secret.locator("[data-secret-value]"));
    assertVisible(secret.getByRole("button", {name: "Reveal", exact: true}));
    assertVisible(secret.getByRole("button", {name: "Copy", exact: true}));
    assertVisible(secret.getByRole("button", {name: "Remove", exact: true}));
    assertText(secret.getByText("box", {exact: true}), "box", {exact: true});
  });
  step("Add row at the bottom", () => {
    assertVisible(getByPlaceholder("NAME", {exact: true}));
    assertVisible(getByPlaceholder("value", {exact: true}));
    assertVisible(getByLabel("secret"));
    assertVisible(getByRole("button", {name: "Add", exact: true}));
  });
  step("Log out", () => {
    flow_guard_logout();
  });
}
