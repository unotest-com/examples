// Red twins of the getByRole keys (#449): each key must be able to make a
// check fail. The twin asserts the count that would hold if the key were
// dropped, on a page where the key leaves the element out (or, for a key
// that widens, lets one in), and expects exactly that count to be refused.
// The control runs the same check on the page where it holds. A key
// dropped on the way (#416: {disabled: false} counted the disabled button)
// leaves the twin's message empty, and the twin red.
//
// The failure names the count, not the locator: the assert messages do not
// quote the locator yet (#535). The callback holds the call itself, so the
// coverage gate reads the key off it.

function role_page(body) {
  return 'data:text/html,' + body;
}

function test_get_by_role_name_twin() {
  step("Twin: {name} leaves the other button out", () => {
    goto(role_page('<button>Cancel</button>'));
    message = caught_message(() => assertCount(getByRole('button', {name: 'Save'}), 1, {timeout: 1000}));
    assertTrue(message.includes('expected 1 elements, got 0'), '{name} should leave Cancel out, got: ' + message);
  });

  step("Control: the named button matches", () => {
    goto(role_page('<button>Save</button>'));
    assertCount(getByRole('button', {name: 'Save'}), 1, {timeout: 1000});
  });
}

function test_get_by_role_exact_twin() {
  step("Twin: {exact: true} leaves a longer name out", () => {
    goto(role_page('<button>Save all</button>'));
    message = caught_message(() => assertCount(getByRole('button', {name: 'Save', exact: true}), 1, {timeout: 1000}));
    assertTrue(message.includes('expected 1 elements, got 0'), '{exact: true} should leave "Save all" out, got: ' + message);
  });

  step("Control: the whole name matches", () => {
    goto(role_page('<button>Save</button>'));
    assertCount(getByRole('button', {name: 'Save', exact: true}), 1, {timeout: 1000});
  });
}

function test_get_by_role_disabled_twin() {
  step("Twin: {disabled: false} leaves the disabled button out", () => {
    goto(role_page('<button disabled>Save</button>'));
    message = caught_message(() => assertCount(getByRole('button', {name: 'Save', disabled: false}), 1, {timeout: 1000}));
    assertTrue(message.includes('expected 1 elements, got 0'), '{disabled: false} should leave the disabled Save out, got: ' + message);
  });

  step("Control: the enabled button matches", () => {
    goto(role_page('<button>Save</button>'));
    assertCount(getByRole('button', {name: 'Save', disabled: false}), 1, {timeout: 1000});
  });
}

function test_get_by_role_checked_twin() {
  step("Twin: {checked: true} leaves the unchecked box out", () => {
    goto(role_page('<label><input type="checkbox">Agree</label>'));
    message = caught_message(() => assertCount(getByRole('checkbox', {name: 'Agree', checked: true}), 1, {timeout: 1000}));
    assertTrue(message.includes('expected 1 elements, got 0'), '{checked: true} should leave the unchecked box out, got: ' + message);
  });

  step("Control: the checked box matches", () => {
    goto(role_page('<label><input type="checkbox" checked>Agree</label>'));
    assertCount(getByRole('checkbox', {name: 'Agree', checked: true}), 1, {timeout: 1000});
  });
}

function test_get_by_role_expanded_twin() {
  step("Twin: {expanded: true} leaves the collapsed button out", () => {
    goto(role_page('<button aria-expanded="false">Menu</button>'));
    message = caught_message(() => assertCount(getByRole('button', {name: 'Menu', expanded: true}), 1, {timeout: 1000}));
    assertTrue(message.includes('expected 1 elements, got 0'), '{expanded: true} should leave the collapsed Menu out, got: ' + message);
  });

  step("Control: the expanded button matches", () => {
    goto(role_page('<button aria-expanded="true">Menu</button>'));
    assertCount(getByRole('button', {name: 'Menu', expanded: true}), 1, {timeout: 1000});
  });
}

function test_get_by_role_pressed_twin() {
  step("Twin: {pressed: true} leaves the released button out", () => {
    goto(role_page('<button aria-pressed="false">Bold</button>'));
    message = caught_message(() => assertCount(getByRole('button', {name: 'Bold', pressed: true}), 1, {timeout: 1000}));
    assertTrue(message.includes('expected 1 elements, got 0'), '{pressed: true} should leave the released Bold out, got: ' + message);
  });

  step("Control: the pressed button matches", () => {
    goto(role_page('<button aria-pressed="true">Bold</button>'));
    assertCount(getByRole('button', {name: 'Bold', pressed: true}), 1, {timeout: 1000});
  });
}

function test_get_by_role_selected_twin() {
  step("Twin: {selected: true} leaves the unselected tab out", () => {
    goto(role_page('<div role="tablist"><div role="tab" aria-selected="false">Tab</div></div>'));
    message = caught_message(() => assertCount(getByRole('tab', {selected: true}), 1, {timeout: 1000}));
    assertTrue(message.includes('expected 1 elements, got 0'), '{selected: true} should leave the unselected tab out, got: ' + message);
  });

  step("Control: the selected tab matches", () => {
    goto(role_page('<div role="tablist"><div role="tab" aria-selected="true">Tab</div></div>'));
    assertCount(getByRole('tab', {selected: true}), 1, {timeout: 1000});
  });
}

function test_get_by_role_level_twin() {
  step("Twin: {level: 2} leaves the h1 out", () => {
    goto(role_page('<h1>Title</h1>'));
    message = caught_message(() => assertCount(getByRole('heading', {name: 'Title', level: 2}), 1, {timeout: 1000}));
    assertTrue(message.includes('expected 1 elements, got 0'), '{level: 2} should leave the h1 out, got: ' + message);
  });

  step("Control: the h2 matches", () => {
    goto(role_page('<h2>Title</h2>'));
    assertCount(getByRole('heading', {name: 'Title', level: 2}), 1, {timeout: 1000});
  });
}

// includeHidden widens: the twin asserts the count without the key (0) and
// the key lets the hidden button in.
function test_get_by_role_include_hidden_twin() {
  step("Twin: {includeHidden: true} lets the hidden button in", () => {
    goto(role_page('<button style="display:none">Ghost</button>'));
    message = caught_message(() => assertCount(getByRole('button', {name: 'Ghost', includeHidden: true}), 0, {timeout: 1000}));
    assertTrue(message.includes('expected 0 elements, got 1'), '{includeHidden: true} should let the hidden Ghost in, got: ' + message);
  });

  step("Control: with no hidden button there is nothing to let in", () => {
    goto(role_page('<p>empty</p>'));
    assertCount(getByRole('button', {name: 'Ghost', includeHidden: true}), 0, {timeout: 1000});
  });
}
