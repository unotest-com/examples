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

function flow_guard_logout() {
  click(getByRole('button', {name: 'Log out', exact: true}));
  waitFor(getByRole('button', {name: 'Log in', exact: true}));
}

// ---------------------------------------------------------------------------
// Administration and Values pages (guard redesign, docs/plans/guard-ui-redesign.md).
// ---------------------------------------------------------------------------

// Administration → end every session except the current one (the row with
// the `you` tag). A licence SEAT is held by a user's recent login, not by a
// live session, so this tidies the table but frees no seat by itself.
function flow_guard_kill_other_sessions() {
  goto('/_guard/admin');
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

// The runner accepts the confirm() dialog on its own (D-OPEN-5).
function guard_remove_value(name) {
  click(guard_value_row(name).getByRole('button', {name: 'Remove', exact: true}));
  waitForCount(guard_value_row(name), 0, {exact: true});
}

// The audit row on the Administration page for event `kind` whose Details
// carry `text` (a value name, `NAME (copy)`, ...). Rows are matched by
// content, not by position: another session's login or logout may land on
// top at any time, and a value's set/removed rows share its name.
function guard_audit_row(kind, text) {
  goto('/_guard/admin');
  return getByRole('table').filter({hasText: 'Event'}).getByRole('row').filter({hasText: kind}).filter({hasText: text});
}
