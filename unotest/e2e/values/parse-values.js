// The value readers a Playwright spec gets from JS: String.match,
// JSON.parse, URLSearchParams and toEqual. The inputs come from the page
// where the page has them (its URL, localStorage), so each call reads a
// string the browser produced, not one the scenario typed twice.

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
}
