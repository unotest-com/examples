// id-box/guard-login
// Guard: admin login on the box-lab stand
// #4287f5
//
// Runs against whatever box APP_BASE_URL points at: `--env lab` is the
// local box-lab stand (docs/testing/box-lab.md). Recorded live via
// explore_*; the locators are the ones flow_guard_login uses.
function test_guard_login() {
  step("Sign in to the box as ivan", () => {
    flow_guard_login("ivan", BOX_LAB_PASSWORD);
  });
  step("Header names the box and the user", () => {
    assertText(getByText(/^unotest/), "unotest", {exact: false});
    assertText(locator(".who"), "ivan", {exact: false});
    assertText(locator(".who").getByText("admin", {exact: true}), "admin", {exact: true});
    assertVisible(getByRole("link", {name: "Administration", exact: true}));
    assertVisible(getByRole("button", {name: "Log out", exact: true}));
  });
  step("Admin reaches the environments picker", () => {
    assertText(getByRole("heading", {name: "Environments", exact: true}), "Environments", {exact: true});
    assertVisible(getByRole("button", {name: "Open viewer", exact: true}));
  });
  step("Log out", () => {
    flow_guard_logout();
  });
}
