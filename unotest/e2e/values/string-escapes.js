// String escapes in quoted strings (#270): \u00A0 and \xA0 are one
// character, so a scenario can name the NBSP a page groups digits with;
// \d and \b stay two characters, so a regex written as text keeps them.
// The NBSP comes from the page (innerText keeps it), not from the
// scenario typing it twice.

function test_string_escapes() {
  step("Name the NBSP the page renders with a hex escape", () => {
    goto("data:text/html;charset=utf-8,<p data-testid='total'>1&nbsp;234</p>");
    total = getInnerText(getByTestId('total'));
    assertTrue(total === '1\u00A0234', 'the u-escape should be the NBSP the page has: ' + total);
    assertTrue(total === '1\xA0234', 'the x-escape should be the same NBSP: ' + total);
    assertTrue(total !== '1 234', 'a plain space is not the NBSP');
    nbsp = '\u00A0';
    assertTrue(nbsp.length === 1, 'the u-escape is one character');
  });

  step("Control characters decode, regex pairs stay as written", () => {
    tab = 'a\tb';
    assertTrue(tab.length === 3, 'a tab is one character');
    assertTrue('\x41\u0042' === 'AB', 'hex escapes give letters');
    digits = '\d+';
    assertTrue(digits.length === 3, 'backslash-d stays two characters');
    word = '\bword\b';
    assertTrue(word.length === 8, 'backslash-b stays as written');
    raw = `\u00A0`;
    assertTrue(raw.length === 6, 'a backtick string stays raw');
  });
}
