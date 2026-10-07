// The value readers a Playwright spec gets from JS: String.match,
// JSON.parse, URLSearchParams, Number, Intl.NumberFormat and toEqual.
// The inputs come from the page where the page has them (its URL,
// localStorage, its text), so each call reads a string the browser
// produced, not one the scenario typed twice.

function test_parse_values() {
  step("Read a query parameter and a regex group off the page URL", () => {
    goto('/?room=42&user=ann%20lee');
    waitForText('Stress-test browser');
    url = getUrl();
    assertEqual(urlParam(url, 'room'), '42');
    assertEqual(urlParam(url, 'user'), 'ann lee');
    assertEqual(urlParam(url, 'missing'), null);
    m = textMatches(url, /room=(\d+)&user=(\w+)/);
    assertTrue(m, url);
    assertEqual(m[1], '42');
    assertEqual(textMatches(url, /nothing=(\d+)/), false);
  });

  step("Parse JSON the page stored and compare it deeply", () => {
    setLocalStorage('dogfood-values', '{"theme":"dark","devices":["pixel","iphone"],"limits":{"tabs":3}}');
    saved = parseJson(getLocalStorage('dogfood-values'));
    assertEqual(saved.devices[1], 'iphone');
    assertEqual(saved, {limits: {tabs: 3}, devices: ['pixel', 'iphone'], theme: 'dark'});
    setLocalStorage('dogfood-values', '');
  });

  step("Read a number the page groups with NBSP, compute, and write it back", () => {
    goto("data:text/html;charset=utf-8,<p data-testid='total'>1&nbsp;234,50</p><p data-testid='usd'>$1,234.50</p><p data-testid='stake'>2.5</p>");
    total = toNumber(getInnerText(getByTestId('total')));
    assertEqual(total, 1234.5);
    assertTrue(total > 1000, 'total: ' + total);
    assertEqual(round(toNumber(getInnerText(getByTestId('stake'))) * 1.85, 2), 4.63);
    assertEqual(round(-2.5), -3);
    // en-US whatever LANG the machine runs with: the control is a run under LANG=de_DE.UTF-8.
    assertEqual(formatNumber(total, {minFractionDigits: 2}), '1,234.50');
    assertText(getByTestId('usd'), textJoin(['$', formatNumber(total, {minFractionDigits: 2, maxFractionDigits: 2})]));
  });
}
