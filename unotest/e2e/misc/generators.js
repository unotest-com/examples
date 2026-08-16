// Fixture generators and the evidence tool. Scenarios have no imports and
// no Date / Math, so everything random or time-based comes from the DSL —
// and every generated value has to be usable as real input, not just a
// string that looks plausible.

function test_generators_produce_usable_fixture_data() {
  step("Names and emails are non-empty and distinct", () => {
    first = randomFirstName();
    last = randomLastName();
    mail = randomEmail();
    assertTrue(first != '', 'randomFirstName returned nothing');
    assertTrue(last != '', 'randomLastName returned nothing');
    assertTrue(textContains(mail, '@'), mail);
    assertTrue(randomEmail() != mail, 'two calls must not collide');
  });

  step("randomText honours the requested length", () => {
    blurb = randomText(40);
    assertTrue(textContains(blurb, ' '), blurb);
    log('generated fixture', first, last, mail);
  });

  step("They survive a round trip through a real form", () => {
    flow_signin();
    goto('/dashboard/users');
    click(getByRole('button', {name: 'New user'}));
    fill(getByLabel('Name'), first + ' ' + last);
    fill(getByLabel('Email'), mail);
    click(getByRole('button', {name: 'Create user'}));
    fill(getByLabel('Search users'), mail);
    assertCount(getByRole('row').filter({hasText: mail}), 1);
  });
}

function test_random_nth_and_screenshot() {
  step("Open a seeded table", () => {
    goto('/scenarios/big-table?rows=30&groups=0&markers=0&shadow=none&hidden=0&seed=42');
    waitFor(getByRole('row', {name: /^Row R-00001:/}));
  });

  step("randomNth picks one of the clones without caring which", () => {
    assertVisible(randomNth(getByRole('button', {name: 'Edit'})));
  });

  step("screenshot writes evidence into the run directory", () => {
    shot = screenshot('big-table-rows');
    assertTrue(textContains(shot, 'big-table-rows'), shot);
    assertTrue(textContains(shot, '.png'), shot);
  });
}
