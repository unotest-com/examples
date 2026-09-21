// Guard (/_guard) of a box: the break-glass login and logout. The box is
// whatever APP_BASE_URL points at — the local box-lab stand with
// `--env lab` (unotest/.env.lab), a real box otherwise. Passwords come
// from unotest/.secrets (BOX_LAB_PASSWORD, BOX_RO_PASSWORD).
function flow_guard_login(username, password) {
  // /_guard/ redirects an anonymous visitor to the primary identity
  // provider; on the stand that is break-glass, so the password form
  // is the landing page.
  goto('/_guard/');
  fill(getByPlaceholder('username', {exact: true}), username);
  fill(getByPlaceholder('password', {exact: true}), password);
  click(getByRole('button', {name: 'Log in', exact: true}));
  waitFor(getByRole('heading', {name: 'Environments', exact: true}));
}

// The break-glass account a box ships with. `admin` in the template that
// goes to customers (private/guard/deploy/compose/guard.config.mjs), and
// the same on the stand: an operator's own name is not a login on
// somebody else's machine. Named here once — the suite signs in as the
// ACCOUNT, and thirteen copies of a login would be thirteen places to
// miss when it changes.
function guard_admin_user() {
  return "admin";
}

// Signing in as that account. Every box scenario but the read-only one and
// the refusal one goes through here.
function flow_guard_admin_login(password) {
  flow_guard_login(guard_admin_user(), password);
}

function flow_guard_logout() {
  click(getByRole('button', {name: 'Log out', exact: true}));
  waitFor(getByRole('button', {name: 'Log in', exact: true}));
}

// ---------------------------------------------------------------------------
// Administration and Values pages.
// ---------------------------------------------------------------------------

// Administration is tabbed: the server renders every section and hides all
// but the active one, so a table on another tab is in the DOM and NOT
// visible — role locators skip it and the assertion reads "0 elements"
// instead of "wrong tab". Named here once, because the path is the only
// thing that tells the page which section to show.
function guard_admin_tab(tab) {
  goto('/_guard/admin?tab=' + tab);
  waitFor(getByRole('heading', {name: 'Administration', exact: true}));
}

// Administration → end every session except the current one (the row with
// the `you` tag). A licence SEAT is held by a user's recent login, not by a
// live session, so this tidies the table but frees no seat by itself.
function flow_guard_kill_other_sessions() {
  // Each kill posts the tab back with it, so the loop stays on Sessions.
  guard_admin_tab('sessions');
  others = getByRole('row').filter({has: getByRole('button', {name: 'kill', exact: true})}).filter({hasNotText: 'you'});
  for (i = 0; i < 20; i = i + 1) {
    if (count(others) == 0) { break; }
    // Each kill re-renders the page and the filtered set shrinks by one;
    // "any other session" is the anchor, not a position.
    click(others.first().getByRole('button', {name: 'kill', exact: true}));
    waitFor(getByRole('heading', {name: 'Administration', exact: true}));
  }
  assertCount(others, 0);
}

function flow_guard_open_env_values(project, environment) {
  goto('/_guard/admin/env/' + project + '/' + environment);
  waitFor(getByRole('heading', {name: project + '/' + environment, exact: true}));
}

// One row of the Values table, by key.
function guard_value_row(name) {
  return locator('tr[data-row="' + name + '"]');
}

// Add row at the bottom of the Values table: NAME · value · [☐ secret] · Add.
function guard_add_value(name, value, secret) {
  fill(getByPlaceholder('NAME', {exact: true}), name);
  fill(getByPlaceholder('value', {exact: true}), value);
  if (secret) { check(getByLabel('secret')); }
  click(getByRole('button', {name: 'Add', exact: true}));
  waitFor(guard_value_row(name));
}

// The confirm() dialog is accepted by the runner itself.
function guard_remove_value(name) {
  click(guard_value_row(name).getByRole('button', {name: 'Remove', exact: true}));
  waitForCount(guard_value_row(name), 0, {exact: true});
}

// The audit row on the Administration page for event `kind` whose Details
// carry `text` (a value name, `NAME (copy)`, ...). Rows are matched by
// content, not by position: another session's login or logout may land on
// top at any time, and a value's set/removed rows share its name.
function guard_audit_row(kind, text) {
  guard_admin_tab('audit');
  return getByRole('table').filter({hasText: 'Event'}).getByRole('row').filter({hasText: kind}).filter({hasText: text});
}
