// id-box/guard-env-values-json-save
// Guard: Values — JSON Save replaces values, keeps masked secrets, rejects bad input
// #4287f5
//
// The JSON is rewritten through evaluate: Save replaces the layers as a
// whole, so the document must carry every existing key and the DSL has no
// string surgery for that. evaluate only computes the text; the page is
// driven through fill/click like everywhere else.
function test_guard_env_values_json_save() {
  step("Sign in as ivan", () => {
    flow_guard_login("ivan", BOX_LAB_PASSWORD);
  });
  step("Add two variables and a secret", () => {
    flow_guard_open_env_values("dogfood", "prod");
    mark = randomWord(6);
    keep = "UT_JKEEP_" + mark;
    drop = "UT_JDROP_" + mark;
    secretName = "UT_JSEC_" + mark;
    secretValue = "js3cret-" + randomWord(8);
    guard_add_value(keep, "v1", false);
    guard_add_value(drop, "bye", false);
    guard_add_value(secretName, secretValue, true);
  });
  step("Save a JSON with one value changed and one key removed", () => {
    configured = getAttribute(locator("table[data-values]"), "data-target-configured");
    area = getByRole("textbox", {name: "JSON document", exact: true});
    check(getByRole("switch", {name: "JSON", exact: true}));
    click(getByRole("button", {name: "Edit", exact: true}));
    // evaluate hands its extra arguments to the function as ONE array.
    edited = evaluate( // lint-ok: rewrites keys inside the editor's JSON document — no typed getter edits JSON
      `([keepName, dropName]) => {
      const doc = JSON.parse(document.querySelector("textarea[data-json]").value);
      doc[keepName] = "v2";
      delete doc[dropName];
      return JSON.stringify(doc, null, 2);
    }`, keep, drop);
    fill(area, edited);
    click(getByRole("button", {name: "Save", exact: true}));
    waitFor(guard_value_row(keep));
    assertText(guard_value_row(keep).locator("[data-text]"), "v2", {exact: true});
    assertCount(guard_value_row(drop), 0);
    assertText(guard_value_row("APP_BASE_URL").locator("[data-text]"), configured, {exact: true});
    // Untouched configured values must not become box overrides.
    assertText(guard_value_row("CATALOG_SEED").getByText("config", {exact: true}), "config", {exact: true});
    assertCount(guard_value_row("CATALOG_SEED").getByRole("button", {name: "Remove", exact: true}), 0);
  });
  step("A masked secret survives the save untouched", () => {
    row = guard_value_row(secretName);
    assertText(row.locator("[data-text]"), "••••••••", {exact: true});
    click(row.getByRole("button", {name: "Reveal", exact: true}));
    assertText(row.locator("[data-secret-value]"), secretValue, {exact: true});
  });
  step("Audit records the batch", () => {
    replaced = guard_audit_row("env.values.replaced", keep);
    assertVisible(replaced);
    assertText(replaced, drop, {exact: false});
  });
  step("Broken JSON is refused inline, nothing is sent", () => {
    flow_guard_open_env_values("dogfood", "prod");
    check(getByRole("switch", {name: "JSON", exact: true}));
    click(getByRole("button", {name: "Edit", exact: true}));
    fill(area, "{ not json");
    click(getByRole("button", {name: "Save", exact: true}));
    assertText(locator("[data-error]"), "not JSON", {exact: false});
    fill(area, "{\"1bad\": \"x\"}");
    click(getByRole("button", {name: "Save", exact: true}));
    assertText(locator("[data-error]"), "is not a variable name", {exact: false});
    reload();
    assertText(guard_value_row(keep).locator("[data-text]"), "v2", {exact: true});
    assertVisible(guard_value_row(secretName));
  });
  step("Clean up", () => {
    guard_remove_value(secretName);
    guard_remove_value(keep);
  });
  step("Log out", () => {
    flow_guard_logout();
  });
}
