// id-box/guard-read-token
// Guard: personal read tokens — mint, shown once, revoke
// #4287f5
//
// The value is deliberately never asserted as TEXT: a scenario that reads
// a live credential writes it into its own journal and screenshots. What
// is asserted is that the page shows one exactly once, and never again.
function test_guard_read_token() {
  step("Sign in as ivan", () => {
    flow_guard_login("ivan", BOX_LAB_PASSWORD);
  });

  step("Open Read tokens", () => {
    goto('/_guard/tokens');
    assertVisible(getByRole('heading', {name: 'Read tokens', exact: true}));
    assertVisible(getByRole('columnheader', {name: 'Label', exact: true}));
    assertVisible(getByRole('columnheader', {name: 'Last used', exact: true}));
    assertVisible(getByRole('columnheader', {name: 'Status', exact: true}));
  });

  step("Mint one: the value is shown, once, with a way to copy it", () => {
    // Unique per run: the table keeps every token ever minted here, and a
    // shared label would make the row locator ambiguous on the second run.
    label = 'read token ' + randomEmail();
    fill(getByLabel('Token label'), label);
    click(getByRole('button', {name: 'Create token', exact: true}));
    notice = locator('.notice');
    assertVisible(notice);
    // Assert on the label and on the PRESENCE of the value, never on the
    // notice's text: an assertion that fails prints the element's whole
    // text, and here that text is a live credential — it would land in
    // the journal, the screenshots and the failure bundle.
    assertText(notice.locator('strong'), label, {exact: true});
    assertVisible(notice.locator('pre'));
    assertVisible(notice.getByRole('button', {name: 'Copy', exact: true}));
  });

  step("Coming back shows the label and never the value again", () => {
    goto('/_guard/tokens');
    assertCount(locator('.notice'), 0);
    row = getByRole('row').filter({hasText: label});
    assertCount(row, 1);
    assertVisible(row.getByRole('button', {name: 'revoke', exact: true}));
  });

  step("Revoke it", () => {
    // The confirm() dialog is accepted by the runner itself.
    click(row.getByRole('button', {name: 'revoke', exact: true}));
    revoked = getByRole('row').filter({hasText: label});
    assertText(revoked, 'revoked', {exact: false});
    assertCount(revoked.getByRole('button', {name: 'revoke', exact: true}), 0);
  });

  step("Log out", () => {
    flow_guard_logout();
  });
}
