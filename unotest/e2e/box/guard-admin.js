// id-box/guard-admin
// Guard: Administration page — users, sessions, audit table
// #4287f5
//
// Locators were exercised live through explore_steps; the recorder cannot
// render filter chains, so the file is written by hand from that log.
function test_guard_admin() {
  step("Sign in as admin", () => {
    flow_guard_admin_login(BOX_LAB_PASSWORD);
  });
  step("Open Administration", () => {
    click(getByRole("link", {name: "Administration", exact: true}));
    assertText(getByRole("heading", {name: "Administration", exact: true}), "Administration", {exact: true});
    // The way back lives in the header. The same word also names a TAB on
    // this page, so an unscoped locator resolves to two links — and the
    // one this step is about is the header's.
    assertVisible(getByRole("banner").getByRole("link", {name: "Environments", exact: true}));
  });
  step("Users table", () => {
    assertText(getByText(/^seats \d+\/\d+ in use$/), "seats", {exact: false});
    me = getByRole("table").filter({hasText: "Last login"}).getByRole("row").filter({hasText: guard_admin_user()});
    assertVisible(me.getByText("you", {exact: true}));
    // Role lives in its own cell (User · Role · Status · Last login). With
    // an account called `admin`, matching the word anywhere in the row
    // would find the NAME and prove nothing about the role.
    assertText(me.getByRole("cell").nth(1), "admin", {exact: false});
    assertVisible(me.getByRole("button", {name: "disable", exact: true}));
  });
  step("Sessions table", () => {
    guard_admin_tab("sessions");
    mine = getByRole("table").filter({hasText: "Started"}).getByRole("row").filter({hasText: "you"});
    assertVisible(mine.getByRole("button", {name: "kill", exact: true}));
  });
  step("Audit is a table", () => {
    guard_admin_tab("audit");
    audit = getByRole("table").filter({hasText: "Event"});
    assertVisible(audit.getByRole("columnheader", {name: "When", exact: true}));
    assertVisible(audit.getByRole("columnheader", {name: "Event", exact: true}));
    assertVisible(audit.getByRole("columnheader", {name: "User", exact: true}));
    assertVisible(audit.getByRole("columnheader", {name: "IP", exact: true}));
    assertVisible(audit.getByRole("columnheader", {name: "Details", exact: true}));
    newest = audit.getByRole("row").nth(1);
    assertText(newest, "login.succeeded", {exact: false});
    // Same reason as the users table: the User column, not the word
    // anywhere in the row — "admin via static" in Details carries it too.
    assertText(newest.getByRole("cell").nth(2), guard_admin_user(), {exact: false});
    assertText(newest, "admin via static", {exact: false});
  });
  step("Raw JSON folds under details", () => {
    assertHidden(newest.locator("pre"));
    click(newest.getByText("json", {exact: true}));
    assertText(newest.locator("pre"), "\"kind\": \"login.succeeded\"", {exact: false});
  });
  step("Log out", () => {
    flow_guard_logout();
  });
}
