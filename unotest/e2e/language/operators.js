// Operators that return values the JavaScript way (#440): && and ||
// give an operand, ?? keeps 0 and '', ?. stops on null and undefined,
// a template interpolates. The settings come from the page.

function test_operators_return_operands() {
  step("?? and ?. on settings the page stored", () => {
    goto('/');
    waitForText('Stress-test browser');
    setLocalStorage('dogfood-settings', '{"limit":0,"title":"","panel":{"width":320}}');
    const s = parseJson(getLocalStorage('dogfood-settings'));
    assertEqual(s.limit ?? 50, 0);
    assertEqual(s.limit || 50, 50);
    assertEqual(s.title ?? 'untitled', '');
    assertEqual(s.missing ?? 'fallback', 'fallback');
    assertEqual(s.panel?.width, 320);
    assertEqual(s.footer?.height, undefined);
    assertEqual(s.footer?.height ?? 'none', 'none');
    assertEqual(s.panel.resize?.(2), undefined);
    setLocalStorage('dogfood-settings', '');
  });

  step("&& and || give an operand, not a boolean", () => {
    assertEqual('a' && 'b', 'b');
    assertEqual('' || 'x', 'x');
    assertEqual(0 && 'never', 0);
    assertEqual(null || undefined, undefined);
  });

  step("Templates, typeof, compound assignment and the conditional", () => {
    const rows = [3, 4];
    assertEqual(`${rows.length} rows, sum ${rows[0] + rows[1]}`, '2 rows, sum 7');
    assertEqual(typeof rows, 'object');
    assertEqual(typeof undefined, 'undefined');
    assertEqual(typeof (() => 1), 'function');
    let n = 2;
    n **= 3;
    n -= 1;
    n %= 4;
    assertEqual(n, 3);
    assertEqual(n > 2 ? 'big' : 'small', 'big');
    assertEqual('k' in { k: 1 }, true);
    assertEqual((1, 2), 2);
    assertEqual(void 0, undefined);
  });
}
