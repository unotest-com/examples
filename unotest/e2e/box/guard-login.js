// id-box/guard-login
// Guard: admin login on the box-lab stand
// #4287f5
//
// Runs against whatever box APP_BASE_URL points at: `--env lab` aims it
// at a local stand instead of a deployed box. Recorded live against the
// page; the locators are the ones flow_guard_login uses.
function test_guard_login() {
  step("Sign in to the box as admin", () => {
    flow_guard_admin_login(BOX_LAB_PASSWORD);
  });
  step("Header names the box and the user", () => {
    assertText(getByText(/^unotest/), "unotest", {exact: false});
    // The account is called `admin` and its ROLE is admin too, so the two
    // read the same in the header. Checked as two different nodes on
    // purpose: one assertion on the word would pass while either half was
    // missing.
    assertText(locator(".who"), guard_admin_user(), {exact: false});
    assertText(locator(".who .tag"), "admin", {exact: true});
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
