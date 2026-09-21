// id-box/guard-environments
// Guard: environments picker with Project and Environment fields
// #4287f5
//
// Needs two projects on the box (box-lab: dogfood + demo, both with a
// bundle) — with one project the Project field is hidden by design.
function test_guard_environments() {
  step("Sign in as admin", () => {
    flow_guard_admin_login(BOX_LAB_PASSWORD);
  });
  step("Picker shows Project and Environment", () => {
    assertVisible(getByLabel("Project", {exact: true}));
    assertValue(getByLabel("Environment", {exact: true}), "dogfood/prod");
    assertText(getByRole("option", {name: "prod", exact: true}), "prod", {exact: true});
    assertText(locator("[data-env-note-text]"), "master@", {exact: false});
  });
  step("Switching project filters environments", () => {
    selectOption(getByLabel("Project", {exact: true}), "demo");
    assertValue(getByLabel("Environment", {exact: true}), "demo/dev");
    selectOption(getByLabel("Project", {exact: true}), "dogfood");
    assertValue(getByLabel("Environment", {exact: true}), "dogfood/prod");
  });
  step("Open the viewer of dogfood/prod", () => {
    click(getByRole("button", {name: "Open viewer", exact: true}));
    assertVisible(getByRole("button", {name: "Scenarios", exact: true}));
    assertVisible(getByTitle(/^Environment: prod/));
  });
}
