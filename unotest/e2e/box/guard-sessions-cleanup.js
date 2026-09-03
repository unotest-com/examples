// id-box/guard-sessions-cleanup
// Guard: end every other session of the box from Administration
// #4287f5
//
// Housekeeping for a shared stand: runs that fail before their Log out
// leave sessions behind. Ends all but the current one and checks the
// table is down to that one row.
function test_guard_sessions_cleanup() {
  step("Sign in as ivan", () => {
    flow_guard_login("ivan", BOX_LAB_PASSWORD);
  });
  step("End every other session", () => {
    flow_guard_kill_other_sessions();
  });
  step("Only this session is left", () => {
    sessions = getByRole("table").filter({hasText: "Started"}).getByRole("row").filter({has: getByRole("button", {name: "kill", exact: true})});
    assertCount(sessions, 1);
    assertVisible(sessions.getByText("you", {exact: true}));
  });
  step("Log out", () => {
    flow_guard_logout();
  });
}
