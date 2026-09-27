// id-box/guard-one-env-viewer
// Guard: a box with ONE environment signs you straight into its viewer
// #4287f5
//
// Needs a box with a single environment (#206). box-lab ships two
// projects on purpose — `demo` exists so the picker has a second entry —
// so on the stand this scenario runs only against a boxd config reduced
// to `dogfood/prod`. On a customer box with one environment it is the
// normal case.
//
// Signs in through flow_guard_sign_in, NOT flow_guard_login: the latter
// goes to /_guard/ afterwards, and this scenario is about where the
// sign-in itself lands.
function test_guard_one_env_viewer() {
  step("Sign in as admin", () => {
    flow_guard_sign_in(guard_admin_user(), BOX_LAB_PASSWORD);
  });

  step("The sign-in lands in the viewer, not on the picker", () => {
    assertVisible(getByRole("button", {name: "Scenarios", exact: true}));
    assertCount(getByRole("heading", {name: "Environments", exact: true}), 0);
  });

  step("The session menu offers the way back to the box pages", () => {
    click(getByText(guard_admin_user(), {exact: true}));
    assertVisible(getByText("box pages", {exact: true}));
    assertText(
      getByText("Environments, read tokens and administration", {exact: true}),
      "Environments, read tokens and administration",
      {exact: true},
    );
  });

  step("It leads to the box pages, Administration among them", () => {
    click(getByText("box pages", {exact: true}));
    assertVisible(getByRole("link", {name: "Administration", exact: true}));
  });
}
