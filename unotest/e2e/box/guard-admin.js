// id-box/guard-admin
// Guard: Administration page — users, sessions, audit table
// #4287f5
//
// Locators were exercised live through explore_steps; the recorder cannot
// render filter chains, so the file is written by hand from that log.
function test_guard_admin() {
  step("Sign in as ivan", () => {
    flow_guard_login("ivan", BOX_LAB_PASSWORD);
  });
  step("Open Administration", () => {
    click(getByRole("link", {name: "Administration", exact: true}));
    assertText(getByRole("heading", {name: "Administration", exact: true}), "Administration", {exact: true});
    assertVisible(getByRole("link", {name: "Environments", exact: true}));
  });
  step("Users table", () => {
    assertText(getByText(/^seats \d+\/\d+ in use$/), "seats", {exact: false});
    me = getByRole("table").filter({hasText: "Last login"}).getByRole("row").filter({hasText: "ivan"});
    assertVisible(me.getByText("you", {exact: true}));
    assertVisible(me.getByText("admin", {exact: true}));
    assertVisible(me.getByRole("button", {name: "disable", exact: true}));
  });
  step("Sessions table", () => {
    mine = getByRole("table").filter({hasText: "Started"}).getByRole("row").filter({hasText: "you"});
    assertVisible(mine.getByRole("button", {name: "kill", exact: true}));
  });
  step("Audit is a table", () => {
    audit = getByRole("table").filter({hasText: "Event"});
    assertVisible(audit.getByRole("columnheader", {name: "When", exact: true}));
    assertVisible(audit.getByRole("columnheader", {name: "Event", exact: true}));
    assertVisible(audit.getByRole("columnheader", {name: "User", exact: true}));
    assertVisible(audit.getByRole("columnheader", {name: "IP", exact: true}));
    assertVisible(audit.getByRole("columnheader", {name: "Details", exact: true}));
    newest = audit.getByRole("row").nth(1);
    assertText(newest, "login.succeeded", {exact: false});
    assertText(newest, "ivan", {exact: false});
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
