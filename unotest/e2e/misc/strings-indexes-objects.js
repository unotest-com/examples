// Language values rather than vocabulary: the members a string answers
// to, object literals kept in a variable, and an index anywhere in a
// chain. Strings come from the page too, so the members are exercised on
// values the runtime produced, not only on literals. The helper that
// receives the object is `describe_user` in _helpers/values.js.

function test_strings_objects_and_indexes() {
  step("String members answer on text read from the page", () => {
    goto('/');
    waitForText('Stress-test browser');
    url = getUrl();
    assertTrue(url.startsWith('http'), url);
    title = getTitle();
    assertTrue(title.trim().length > 0, 'page title is blank');
    assertTrue(title.includes(title.trim()), title);
  });

  step("length, trim, includes and startsWith compute like JS", () => {
    padded = '  abcdef  ';
    assertTrue(padded.length === 10, padded);
    assertTrue(padded.trim() === 'abcdef', padded);
    assertTrue(padded.trim().length === 6, padded);
    assertTrue(padded.includes('cd'), padded);
    assertTrue(padded.includes('zz') == false, padded);
    if (padded.trim().startsWith('ab')) {
      log('startsWith in a condition', padded.trim());
    } else {
      assertTrue(false, 'startsWith("ab") was false');
    }
  });

  step("An object literal in a variable reaches a helper intact", () => {
    user = {name: 'Alice', contact: {emails: ['a@b.c', 'alt@b.c']}, tags: [{id: 1}, {id: 2}]};
    assertTrue(describe_user(user) == 'Alice <a@b.c>', describe_user(user));
  });

  step("An index works anywhere in a chain", () => {
    assertTrue(user.tags[1].id === 2, json(user));
    assertTrue(user.contact.emails[1].startsWith('alt'), json(user));
    nested = {a: {b: [[1, 2], [3, 4]]}};
    assertTrue(nested.a.b[1][0] === 3, json(nested));
  });
}
