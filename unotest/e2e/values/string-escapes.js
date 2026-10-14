// String escapes read as JavaScript reads them (#270, #440). A quoted
// string decodes every escape: \u00A0 and \xA0 are the NBSP a page
// groups digits with, \b is a backspace, and a backslash before a letter
// with no meaning is dropped. Text that must keep its backslashes — a
// regex written as a string — doubles them or goes through String.raw.
// The NBSP comes from the page (innerText keeps it), not from the
// scenario typing it twice.

function test_string_escapes() {
  step("Name the NBSP the page renders with a hex escape", () => {
    goto("data:text/html;charset=utf-8,<p data-testid='total'>1&nbsp;234</p>");
    const total = getInnerText(getByTestId('total'));
    assertEqual(total, '1\u00A0234');
    assertEqual(total, '1\xA0234');
    assertTrue(total !== '1 234', 'a plain space is not the NBSP');
    assertEqual('\u00A0'.length, 1);
    assertEqual('\u{1F600}'.length, 2);
  });

  step("Escapes in quotes decode the JavaScript way", () => {
    assertEqual('a\tb'.length, 3);
    assertEqual('\x41\u0042', 'AB');
    assertEqual('\b'.length, 1);
    assertEqual('\b', '\u0008');
    assertEqual('\d+', 'd+');
    assertEqual('it\'s', "it's");
  });

  step("A regex written as text keeps its backslashes doubled or raw", () => {
    const doubled = '\\d+';
    assertEqual(doubled.length, 3);
    const raw = String.raw`\d+`;
    assertEqual(raw, doubled);
    assertEqual(String.raw`\u00A0`.length, 6);
    assertEqual('order 1234'.match(doubled)[0], '1234');
  });

  step("A template interpolates and keeps a real line break", () => {
    const rows = 3;
    assertEqual(`${rows} rows`, '3 rows');
    assertEqual(`a
b`, 'a\nb');
  });
}
