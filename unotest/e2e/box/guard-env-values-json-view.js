// id-box/guard-env-values-json-view
// Guard: Values — JSON view masks secrets until Reveal all
// #4287f5
//
// Steps were exercised live through explore_steps; written by hand because
// the recorder cannot render css+role chains. The textarea content is read
// with inputValue: the script writes `.value`, so its text content is empty.
function test_guard_env_values_json_view() {
  step("Sign in as ivan", () => {
    flow_guard_login("ivan", BOX_LAB_PASSWORD);
  });
  step("Add a variable and a secret", () => {
    flow_guard_open_env_values("dogfood", "prod");
    mark = randomWord(6);
    varName = "UT_JSONV_" + mark;
    secretName = "UT_JSONS_" + mark;
    secretValue = "js3cret-" + randomWord(8);
    guard_add_value(varName, "jv1", false);
    guard_add_value(secretName, secretValue, true);
  });
  step("Switch to JSON", () => {
    area = getByRole("textbox", {name: "JSON document", exact: true});
    check(getByRole("switch", {name: "JSON", exact: true}));
    assertVisible(locator("[data-json-panel]"));
    assertHidden(locator("table[data-values]"));
    text = inputValue(area);
    assertTrue(textContains(text, "\"" + varName + "\": \"jv1\""), text);
    assertTrue(textContains(text, "\"" + secretName + "\": \"••••\""), text);
    assertTrue(textContains(text, "\"APP_BASE_URL\": "), text);
    assertTrue(textContains(text, secretValue) == false, "secret value must not be in the JSON before Reveal all");
  });
  step("Reveal all secrets at once", () => {
    click(getByRole("button", {name: "Reveal all", exact: true}));
    assertHidden(locator("[data-error]"));
    // The reveal is a fetch; the textarea is rebuilt when it lands.
    for (i = 0; i < 25; i = i + 1) {
      text = inputValue(area);
      if (textContains(text, secretValue)) { break; }
      pause(200); // lint-ok: polling the textarea value, getByText cannot see a textarea's value
    }
    assertTrue(textContains(text, "\"" + secretName + "\": \"" + secretValue + "\""), text);
  });
  step("Edit and Cancel in JSON", () => {
    assertHidden(getByRole("button", {name: "Save", exact: true}));
    click(getByRole("button", {name: "Edit", exact: true}));
    assertVisible(getByRole("button", {name: "Save", exact: true}));
    assertVisible(getByRole("button", {name: "Cancel", exact: true}));
    assertHidden(getByRole("button", {name: "Reveal all", exact: true}));
    click(getByRole("button", {name: "Cancel", exact: true}));
    assertHidden(getByRole("button", {name: "Save", exact: true}));
  });
  step("One audit record lists every secret", () => {
    assertVisible(guard_audit_row("secret.revealed", ", " + secretName + " (show)"));
  });
  step("Clean up", () => {
    flow_guard_open_env_values("dogfood", "prod");
    guard_remove_value(secretName);
    guard_remove_value(varName);
  });
  step("Log out", () => {
    flow_guard_logout();
  });
}
