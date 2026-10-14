// Rewrite of standalone 2026-09-28 items 1, 3 and 7 (#270, #272): an
// amount the page prints with an NBSP, and the payout computed from the
// stake and odds the page shows. The suite built the NBSP by pasting the
// invisible character and computed the payout with shell('node', '-e').
// In plain JS: a quoted NBSP escape and Math.round on page numbers.

const NBSP = '\u00A0';

function amount(currency, value) {
  return currency + NBSP + value;
}

function test_amount_with_nbsp_and_payout() {
  step("The bet line reads the amounts the stake and odds give", () => {
    goto("data:text/html;charset=utf-8,<p data-testid='stake'>500</p><p data-testid='odds'>1.66</p><p data-testid='line'>Placed · S/&nbsp;500 · to win 830</p>");
    const stake = Number(getInnerText(getByTestId('stake')));
    const odds = Number(getInnerText(getByTestId('odds')));
    const payout = Math.round(stake * odds);
    assertEqual(payout, 830);
    assertText(getByTestId('line'), `Placed · ${amount('S/', stake)} · to win ${payout}`);
    assertTrue(!getInnerText(getByTestId('line')).includes('S/ 500'), 'the amount is joined by an NBSP, not a space');
  });

  step("A digit pattern from page text, written as a regex literal", () => {
    const line = getInnerText(getByTestId('line'));
    const [, won] = line.match(/to win (\d+)/);
    assertEqual(Number(won), 830);
    assertEqual(line.split(/\s·\s/).length, 3);
  });
}
