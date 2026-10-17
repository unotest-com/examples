// The scenario library (#440): Math (Math.random too), JSON, Number, String, Array, Object,
// Map and Set, and the global parsers, by libraryCatalog(). Prices and names come from
// the page, so each member works on values the browser produced.

function test_library_on_page_values() {
  step("Read prices off the page and compute with Math and Number", () => {
    goto("data:text/html,<ul><li>12.50</li><li>3.75</li><li>40</li></ul><p data-testid='raw'>  Ann Lee, bob ; CY  </p>");
    const items = getByRole('listitem');
    const prices = [];
    for (let i = 0; i < count(items); i++) {
      prices.push(Number(getInnerText(items.nth(i))));
    }
    assertEqual(prices, [12.5, 3.75, 40]);
    assertEqual(Math.max(...prices), 40);
    assertEqual(Math.round(prices[1] * 10) / 10, 3.8);
    assertEqual(Math.floor(-0.5), -1);
    assertEqual(Math.abs(-2) + Math.sign(-3), 1);
    assertEqual(Math.hypot(3, 4), 5);
    assertEqual((56.25).toFixed(1), '56.3');
    assertEqual((255).toString(16), 'ff');
    assertEqual(Number.isInteger(prices[2]), true);
    assertEqual(Number.parseFloat('1.5kg'), 1.5);
    assertEqual(parseInt('08', 10), 8);
    assertEqual(isNaN(Number('x')), true);
    assertEqual(Number.isFinite(1 / 0), false);
    const r = Math.random();
    assertEqual(r >= 0 && r < 1, true);
    const pick = prices[Math.floor(r * prices.length)];
    assertEqual(prices.includes(pick), true);
  });

  step("Clean a list of names with String members", () => {
    const raw = getInnerText(getByTestId('raw'));
    const names = raw.split(/[,;]/).map((s) => s.trim()).filter((s) => s.length > 0);
    assertEqual(names, ['Ann Lee', 'bob', 'CY']);
    const tags = names.map((n) => n.toLowerCase().replaceAll(' ', '-'));
    assertEqual(tags, ['ann-lee', 'bob', 'cy']);
    assertEqual('7'.padStart(3, '0'), '007');
    assertEqual('ab'.repeat(2).at(-1), 'b');
    assertEqual('Order #1234'.match(/#(\d+)/)[1], '1234');
    assertEqual([...'a1b2'.matchAll(/\d/g)].map((m) => m[0]), ['1', '2']);
    assertEqual('abc'.startsWith('ab') && 'abc'.endsWith('bc'), true);
    assertEqual(String(42) + String.raw`\n`, '42\\n');
    assertEqual(/b+/.test('abbc'), true);
  });

  step("Group and sort rows with Array and Object", () => {
    const rows = [
      { name: 'cy', team: 'b', score: 3 },
      { name: 'ann', team: 'a', score: 9 },
      { name: 'bob', team: 'a', score: 5 },
    ];
    const byTeam = rows.reduce((acc, r) => {
      acc[r.team] = (acc[r.team] ?? []).concat([r.name]);
      return acc;
    }, {});
    assertEqual(byTeam, { b: ['cy'], a: ['ann', 'bob'] });
    assertEqual(Object.keys(byTeam).toSorted(), ['a', 'b']);
    assertEqual(rows.toSorted((x, y) => y.score - x.score).map((r) => r.name), ['ann', 'bob', 'cy']);
    assertEqual(rows.find((r) => r.score > 4).name, 'ann');
    assertEqual(rows.findLastIndex((r) => r.team === 'a'), 2);
    assertEqual(rows.some((r) => r.score > 8) && rows.every((r) => r.score > 0), true);
    assertEqual(rows.flatMap((r) => [r.score, r.score]).length, 6);
    assertEqual([[1, [2]], [3]].flat(2), [1, 2, 3]);
    assertEqual(Array.from({ length: 3 }, (_, i) => i * i), [0, 1, 4]);
    assertEqual(Array.isArray(rows) && !Array.isArray('rows'), true);
    assertEqual(Object.fromEntries(Object.entries({ a: 1, b: 2 }).map(([k, v]) => [k, v * 10])), { a: 10, b: 20 });
    assertEqual(Object.hasOwn(rows[0], 'team'), true);
    assertEqual(Object.assign({}, { a: 1 }, { b: 2 }), { a: 1, b: 2 });
  });

  step("Count and dedupe page values with Map and Set", () => {
    goto("data:text/html,<ul><li>a</li><li>b</li><li>a</li><li>c</li><li>a</li></ul>");
    const items = getByRole('listitem');
    const counts = new Map();
    for (let i = 0; i < count(items); i++) {
      const t = getInnerText(items.nth(i));
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    assertEqual(counts.size, 3);
    assertEqual(counts.get('a'), 3);
    assertEqual(counts.has('z'), false);
    assertEqual([...counts.keys()], ['a', 'b', 'c']);
    assertEqual([...counts.entries()].filter(([, n]) => n === 1).map(([k]) => k), ['b', 'c']);
    const pairs = [];
    for (const [k, n] of counts) pairs.push(k + n);
    assertEqual(pairs, ['a3', 'b1', 'c1']);
    const seen = new Set(counts.keys());
    seen.add('a').add('d');
    assertEqual([...seen], ['a', 'b', 'c', 'd']);
    assertEqual(seen.delete('d') && !seen.has('d'), true);
    assertEqual(Array.from(new Map(counts)).length, 3);
    note('counts', counts);
  });

  step("JSON round-trips what the page will store", () => {
    goto('/');
    waitForText('Stress-test browser');
    const state = { tabs: [1, 2], theme: 'dark', panel: null };
    setLocalStorage('dogfood-library', JSON.stringify(state));
    const back = JSON.parse(getLocalStorage('dogfood-library'));
    assertEqual(back, state);
    assertEqual(JSON.stringify({ b: 1, a: [true] }), '{"b":1,"a":[true]}');
    setLocalStorage('dogfood-library', '');
  });
}
