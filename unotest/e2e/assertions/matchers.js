// Assertions with a regex, a list, an attribute, a URL and {not}. A data: page
// keeps the state under test in the scenario: a list, a menu button whose
// aria-expanded flips on click, and a status that changes from "Saving…"
// to "Saved" a moment after load, so {not} has something to wait for.

function test_assert_matchers() {
  step("Open a page with a list, a menu and a status that changes", () => {
    goto("data:text/html;charset=utf-8,<ul><li>Apple</li><li>Banana%202kg</li><li>Cherry</li></ul><button aria-expanded='false' onclick='this.ariaExpanded=String(true)'>Menu</button><a href='/docs/intro'>Docs</a><p role='status' id='s'>Saving…</p><script>setTimeout(function(){document.getElementById('s').textContent='Saved'},800)</script>");
  });

  step("A regex and {not} on a text that changes", () => {
    assertText(getByRole('status'), 'Saving…');
    assertText(getByRole('status'), 'Saving…', {not: true});
    assertText(getByRole('status'), 'Saved');
    assertText(getByRole('status'), /^Sav(ed|ing)/);
    assertText(getByRole('status'), '', {not: true});
  });

  step("A list in order, strings exact, a regex where the text varies", () => {
    assertTexts(getByRole('listitem'), ['Apple', /^Banana/, 'Cherry']);
  });

  step("An attribute that changes on click, and one matched by a regex", () => {
    assertAttribute(getByRole('button', {name: 'Menu'}), 'aria-expanded', 'false');
    click(getByRole('button', {name: 'Menu'}));
    assertAttribute(getByRole('button', {name: 'Menu'}), 'aria-expanded', 'true');
    assertAttribute(getByRole('button', {name: 'Menu'}), 'aria-expanded', 'false', {not: true});
    assertAttribute(getByRole('link', {name: 'Docs'}), 'href', /\/docs\//);
  });

  // A data: page cannot navigate by a link, so the URL under test is a
  // second data: page whose markup carries the path.
  step("A URL by regex, waited for and asserted; a string still a substring", () => {
    goto("data:text/html;charset=utf-8,<p>/cars/42</p>");
    waitForUrl(/\/cars\/\d+/);
    assertUrl(/^data:text\/html.*\/cars\/\d+/);
    assertUrl('/cars/42');
  });
}
