// The narrowing options of getByRole / getByTitle / locator / filter (#526),
// each checked by how many elements the locator matches. A control beside
// each: the same locator without the key matches a different number.
// Inline page (a data: URL, so no `#` in it: that starts the fragment):
// one page holds every ARIA state the keys select on.

function locators_page_url() {
  return 'data:text/html,<style>.gone{display:none}</style>' +
    '<h1>Title</h1><h2>Title</h2><h3>Section</h3>' +
    '<button aria-expanded="true">Menu</button><button aria-expanded="false">Menu</button>' +
    '<button aria-pressed="true">Bold</button><button aria-pressed="false">Bold</button>' +
    '<div role="tablist"><div role="tab" aria-selected="true">Tab</div><div role="tab" aria-selected="false">Tab</div></div>' +
    '<button>Ghost</button><button class="gone">Ghost</button>' +
    '<span title="Close">x</span><span title="Close all">xx</span>' +
    '<ul><li class="item">Alpha <b class="badge">new</b></li>' +
    '<li class="item">Beta <b class="badge">new</b></li>' +
    '<li class="item">Gamma</li></ul>';
}

function test_locator_options_get_by_role() {
  step("Open the page", () => {
    goto(locators_page_url());
    assertCount(getByRole('heading'), 3);
  });

  step("{level} keeps the heading of that level only", () => {
    assertCount(getByRole('heading', {name: 'Title'}), 2);
    assertCount(getByRole('heading', {name: 'Title', level: 2}), 1);
    assertText(getByRole('heading', {name: 'Title', level: 1}), 'Title');
  });

  step("{expanded}, {pressed}, {selected} keep the element in that ARIA state", () => {
    assertCount(getByRole('button', {name: 'Menu'}), 2);
    assertCount(getByRole('button', {name: 'Menu', expanded: true}), 1);
    assertCount(getByRole('button', {name: 'Bold'}), 2);
    assertCount(getByRole('button', {name: 'Bold', pressed: false}), 1);
    assertCount(getByRole('tab'), 2);
    assertCount(getByRole('tab', {selected: true}), 1);
  });

  step("{includeHidden: true} also matches the button display:none hides", () => {
    assertCount(getByRole('button', {name: 'Ghost'}), 1);
    assertCount(getByRole('button', {name: 'Ghost', includeHidden: true}), 2);
  });
}

function test_locator_options_title_and_filters() {
  step("Open the page", () => {
    goto(locators_page_url());
  });

  step("getByTitle matches a substring; {exact: true} the whole title only", () => {
    assertCount(getByTitle('Close'), 2);
    assertCount(getByTitle('Close', {exact: true}), 1);
    assertText(getByTitle('Close', {exact: true}), 'x');
  });

  step("locator {has} / {hasNot} keep the items with / without a badge", () => {
    assertCount(locator('li.item'), 3);
    assertCount(locator('li.item', {has: locator('.badge')}), 2);
    assertCount(locator('li.item', {hasNot: locator('.badge')}), 1);
    assertText(locator('li.item', {hasNot: locator('.badge')}), 'Gamma');
  });

  step("locator {hasNotText} drops the item with that text", () => {
    assertCount(locator('li.item', {hasNotText: 'Beta'}), 2);
  });

  step("filter {hasNot} is the same narrowing on a built locator", () => {
    assertCount(getByRole('listitem').filter({hasNot: locator('.badge')}), 1);
    assertText(getByRole('listitem').filter({hasNot: locator('.badge')}), 'Gamma');
  });
}
