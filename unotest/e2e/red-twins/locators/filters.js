// Red twins of the narrowing keys of locator(sel, {...}) and
// loc.filter({...}) (#449): hasText, hasNotText, has, hasNot. Without the
// key the list item matches; the twin asserts that match on a page where
// the key must leave the item out. The control shows the item the key
// keeps. Same shape as get-by-role.js: the failure names the count until
// the messages quote the locator (#535).

function list_page(items) {
  return 'data:text/html,<ul>' + items + '</ul>';
}

function test_locator_has_text_twin() {
  step("Twin: {hasText} leaves the other item out", () => {
    goto(list_page('<li>Alpha</li>'));
    message = caught_message(() => assertCount(locator('li', {hasText: 'Beta'}), 1, {timeout: 1000}));
    assertTrue(message.includes('expected 1 elements, got 0'), '{hasText} should leave Alpha out, got: ' + message);
  });

  step("Control: the item with the text matches", () => {
    goto(list_page('<li>Beta</li>'));
    assertCount(locator('li', {hasText: 'Beta'}), 1, {timeout: 1000});
  });
}

function test_locator_has_not_text_twin() {
  step("Twin: {hasNotText} leaves the item with the text out", () => {
    goto(list_page('<li>Alpha</li>'));
    message = caught_message(() => assertCount(locator('li', {hasNotText: 'Alpha'}), 1, {timeout: 1000}));
    assertTrue(message.includes('expected 1 elements, got 0'), '{hasNotText} should leave Alpha out, got: ' + message);
  });

  step("Control: an item without the text matches", () => {
    goto(list_page('<li>Beta</li>'));
    assertCount(locator('li', {hasNotText: 'Alpha'}), 1, {timeout: 1000});
  });
}

function test_locator_has_twin() {
  step("Twin: {has} leaves the item without a badge out", () => {
    goto(list_page('<li>Alpha</li>'));
    message = caught_message(() => assertCount(locator('li', {has: locator('b')}), 1, {timeout: 1000}));
    assertTrue(message.includes('expected 1 elements, got 0'), '{has} should leave the plain item out, got: ' + message);
  });

  step("Control: the item with a badge matches", () => {
    goto(list_page('<li>Alpha <b>new</b></li>'));
    assertCount(locator('li', {has: locator('b')}), 1, {timeout: 1000});
  });
}

function test_locator_has_not_twin() {
  step("Twin: {hasNot} leaves the item with a badge out", () => {
    goto(list_page('<li>Alpha <b>new</b></li>'));
    message = caught_message(() => assertCount(locator('li', {hasNot: locator('b')}), 1, {timeout: 1000}));
    assertTrue(message.includes('expected 1 elements, got 0'), '{hasNot} should leave the badged item out, got: ' + message);
  });

  step("Control: the plain item matches", () => {
    goto(list_page('<li>Alpha</li>'));
    assertCount(locator('li', {hasNot: locator('b')}), 1, {timeout: 1000});
  });
}

function test_filter_has_text_twin() {
  step("Twin: filter {hasText} leaves the other item out", () => {
    goto(list_page('<li>Alpha</li>'));
    message = caught_message(() => assertCount(getByRole('listitem').filter({hasText: 'Beta'}), 1, {timeout: 1000}));
    assertTrue(message.includes('expected 1 elements, got 0'), 'filter {hasText} should leave Alpha out, got: ' + message);
  });

  step("Control: the item with the text matches", () => {
    goto(list_page('<li>Beta</li>'));
    assertCount(getByRole('listitem').filter({hasText: 'Beta'}), 1, {timeout: 1000});
  });
}

function test_filter_has_not_text_twin() {
  step("Twin: filter {hasNotText} leaves the item with the text out", () => {
    goto(list_page('<li>Alpha</li>'));
    message = caught_message(() => assertCount(getByRole('listitem').filter({hasNotText: 'Alpha'}), 1, {timeout: 1000}));
    assertTrue(message.includes('expected 1 elements, got 0'), 'filter {hasNotText} should leave Alpha out, got: ' + message);
  });

  step("Control: an item without the text matches", () => {
    goto(list_page('<li>Beta</li>'));
    assertCount(getByRole('listitem').filter({hasNotText: 'Alpha'}), 1, {timeout: 1000});
  });
}

function test_filter_has_twin() {
  step("Twin: filter {has} leaves the item without a badge out", () => {
    goto(list_page('<li>Alpha</li>'));
    message = caught_message(() => assertCount(getByRole('listitem').filter({has: locator('b')}), 1, {timeout: 1000}));
    assertTrue(message.includes('expected 1 elements, got 0'), 'filter {has} should leave the plain item out, got: ' + message);
  });

  step("Control: the item with a badge matches", () => {
    goto(list_page('<li>Alpha <b>new</b></li>'));
    assertCount(getByRole('listitem').filter({has: locator('b')}), 1, {timeout: 1000});
  });
}

function test_filter_has_not_twin() {
  step("Twin: filter {hasNot} leaves the item with a badge out", () => {
    goto(list_page('<li>Alpha <b>new</b></li>'));
    message = caught_message(() => assertCount(getByRole('listitem').filter({hasNot: locator('b')}), 1, {timeout: 1000}));
    assertTrue(message.includes('expected 1 elements, got 0'), 'filter {hasNot} should leave the badged item out, got: ' + message);
  });

  step("Control: the plain item matches", () => {
    goto(list_page('<li>Alpha</li>'));
    assertCount(getByRole('listitem').filter({hasNot: locator('b')}), 1, {timeout: 1000});
  });
}
