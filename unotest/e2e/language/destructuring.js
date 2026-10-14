// Destructuring (#440): object and array patterns with defaults and rest,
// in declarations, parameters, for…of and catch. The row comes from JSON
// the page stored, so the pattern takes apart a value the browser kept.

function user_line({ name, role = 'viewer', ...rest }) {
  return `${name}:${role}:${Object.keys(rest).join(',')}`;
}

function test_destructuring_takes_values_apart() {
  step("Take apart a row the page stored", () => {
    goto('/');
    waitForText('Stress-test browser');
    setLocalStorage('dogfood-row', '{"id":7,"name":"ann","tags":["a","b","c"],"address":{"city":"Riga"}}');
    const row = parseJson(getLocalStorage('dogfood-row'));
    const { id, name: who, address: { city }, missing = 'none' } = row;
    assertEqual([id, who, city, missing], [7, 'ann', 'Riga', 'none']);
    const [first, , ...others] = row.tags;
    assertEqual(first, 'a');
    assertEqual(others, ['c']);
    setLocalStorage('dogfood-row', '');
  });

  step("Patterns in parameters, defaults and rest", () => {
    assertEqual(user_line({ name: 'bo', team: 'x', seat: 3 }), 'bo:viewer:team,seat');
    assertEqual(user_line({ name: 'cy', role: 'admin' }), 'cy:admin:');
    const sum = (...xs) => xs.reduce((a, b) => a + b, 0);
    assertEqual(sum(1, 2, 3), 6);
  });

  step("Patterns in for…of, swaps and spread", () => {
    const seen = [];
    for (const [key, value] of Object.entries({ a: 1, b: 2 })) {
      seen.push(key + value);
    }
    assertEqual(seen, ['a1', 'b2']);
    let x = 1;
    let y = 2;
    [x, y] = [y, x];
    assertEqual([x, y], [2, 1]);
    const merged = { ...{ a: 1, b: 1 }, b: 2, ...{ c: 3 } };
    assertEqual(merged, { a: 1, b: 2, c: 3 });
    assertEqual([...'ab', ...[1]], ['a', 'b', 1]);
  });

  step("A pattern in catch", () => {
    let got = '';
    try {
      throw { code: 409, detail: 'conflict' };
    } catch ({ code, detail }) {
      got = `${code} ${detail}`;
    }
    assertEqual(got, '409 conflict');
  });
}
