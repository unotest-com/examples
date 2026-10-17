// Red twins of {exact} on the text builders (#449): getByText, getByLabel,
// getByPlaceholder, getByAltText, getByTitle. Without the key a builder
// matches a substring; the twin asserts that substring match on a page
// whose only candidate is longer, and expects {exact: true} to leave it
// out. The control finds the whole text. Same shape as get-by-role.js:
// the failure names the count until the messages quote the locator (#535).

function text_page(body) {
  return 'data:text/html,' + body;
}

function test_get_by_text_exact_twin() {
  let message;
  step("Twin: {exact: true} leaves a longer text out", () => {
    goto(text_page('<p>Save all</p>'));
    message = caught_message(() => assertCount(getByText('Save', {exact: true}), 1, {timeout: 1000}));
    assertTrue(message.includes('expected 1 elements, got 0'), '{exact: true} should leave "Save all" out, got: ' + message);
  });

  step("Control: the whole text matches", () => {
    goto(text_page('<p>Save</p>'));
    assertCount(getByText('Save', {exact: true}), 1, {timeout: 1000});
  });
}

function test_get_by_label_exact_twin() {
  let message;
  step("Twin: {exact: true} leaves a longer label out", () => {
    goto(text_page('<label>Email address <input></label>'));
    message = caught_message(() => assertCount(getByLabel('Email', {exact: true}), 1, {timeout: 1000}));
    assertTrue(message.includes('expected 1 elements, got 0'), '{exact: true} should leave "Email address" out, got: ' + message);
  });

  step("Control: the whole label matches", () => {
    goto(text_page('<label>Email <input></label>'));
    assertCount(getByLabel('Email', {exact: true}), 1, {timeout: 1000});
  });
}

function test_get_by_placeholder_exact_twin() {
  let message;
  step("Twin: {exact: true} leaves a longer placeholder out", () => {
    goto(text_page('<input placeholder="Search all">'));
    message = caught_message(() => assertCount(getByPlaceholder('Search', {exact: true}), 1, {timeout: 1000}));
    assertTrue(message.includes('expected 1 elements, got 0'), '{exact: true} should leave "Search all" out, got: ' + message);
  });

  step("Control: the whole placeholder matches", () => {
    goto(text_page('<input placeholder="Search">'));
    assertCount(getByPlaceholder('Search', {exact: true}), 1, {timeout: 1000});
  });
}

function test_get_by_alt_text_exact_twin() {
  let message;
  step("Twin: {exact: true} leaves a longer alt text out", () => {
    goto(text_page('<img alt="Logo big">'));
    message = caught_message(() => assertCount(getByAltText('Logo', {exact: true}), 1, {timeout: 1000}));
    assertTrue(message.includes('expected 1 elements, got 0'), '{exact: true} should leave "Logo big" out, got: ' + message);
  });

  step("Control: the whole alt text matches", () => {
    goto(text_page('<img alt="Logo">'));
    assertCount(getByAltText('Logo', {exact: true}), 1, {timeout: 1000});
  });
}

function test_get_by_title_exact_twin() {
  let message;
  step("Twin: {exact: true} leaves a longer title out", () => {
    goto(text_page('<span title="Close all">x</span>'));
    message = caught_message(() => assertCount(getByTitle('Close', {exact: true}), 1, {timeout: 1000}));
    assertTrue(message.includes('expected 1 elements, got 0'), '{exact: true} should leave "Close all" out, got: ' + message);
  });

  step("Control: the whole title matches", () => {
    goto(text_page('<span title="Close">x</span>'));
    assertCount(getByTitle('Close', {exact: true}), 1, {timeout: 1000});
  });
}
