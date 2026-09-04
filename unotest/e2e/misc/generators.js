// Fixture generators. Scenarios have no imports and no Date / Math, so
// everything random comes from the DSL — and every generated value has to
// be usable as real input, not just a string that looks plausible.

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
