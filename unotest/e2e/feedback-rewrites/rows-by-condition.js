// Rewrite of unopipe 2026-10-09 items 1 and 2 (#380, #379): rows that
// match a condition, counted and read without evaluateOnLocator. The
// suite read the chat list in page code because arrows took no
// parameters, arrays had no push and a file had no top-level const.
// In plain JS: a loop over locators, arrows with block bodies, filter.

const PAIR = '⇄';

function status_rows(list) {
  const rows = [];
  for (let i = 0; i < count(list); i++) {
    const row = list.nth(i);
    const name = getInnerText(row.getByTestId('name'));
    if (name.includes(PAIR)) continue;
    const line = row.getByTestId('status');
    rows.push({
      agent: name,
      status: count(line) === 0 ? null : getAttribute(line, 'data-status'),
    });
  }
  return rows;
}

function test_rows_by_condition_in_plain_js() {
  step("Read the agents' status lines, pair rows left out", () => {
    goto("data:text/html;charset=utf-8,<ul><li><b data-testid='name'>ann/helper</b><i data-testid='status' data-status='online'>online</i></li><li><b data-testid='name'>bob</b></li><li><b data-testid='name'>ann ⇄ bob</b><i data-testid='status' data-status='busy'>busy</i></li><li><b data-testid='name'>cy</b><i data-testid='status' data-status='stale'>stale</i></li></ul>");
    const rows = status_rows(getByRole('listitem'));
    assertEqual(rows, [
      { agent: 'ann/helper', status: 'online' },
      { agent: 'bob', status: null },
      { agent: 'cy', status: 'stale' },
    ]);
  });

  step("Count rows by a condition with a block-bodied arrow", () => {
    const rows = status_rows(getByRole('listitem'));
    const live = rows.filter((row) => {
      const known = row.status !== null;
      return known && row.status !== 'stale';
    });
    assertEqual(live.map(({ agent }) => agent), ['ann/helper']);
    assertEqual(rows.filter((r) => r.status === null).length, 1);
  });
}
