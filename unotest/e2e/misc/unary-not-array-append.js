// Language operators rather than vocabulary: logical not and appending to
// an array. Both run on values the page produced, not only on literals,
// and the array goes through a helper the way a suite collects results.
// The helper is `append_twice` in _helpers/values.js.

function test_unary_not_and_array_append() {
  step("! negates a value read from the page", () => {
    goto('/');
    waitForText('Stress-test browser');
    heading = getByText('Stress-test browser');
    assertTrue(!!isVisible(heading), 'the heading should be visible');
    assertTrue(!(getTitle().trim().length == 0), 'page title is blank');
    blank = '';
    if (!blank) {
      log('an empty string is falsy under !');
    } else {
      assertTrue(false, '!"" was false');
    }
  });

  step("push appends in place and returns the new length", () => {
    seen = [];
    n = seen.push(getTitle());
    assertTrue(n === 1, json(seen));
    seen.push(getUrl(), 'third');
    assertTrue(seen.length === 3, json(seen));
    assertTrue(seen[1].startsWith('http'), json(seen));
  });

  step("an alias and a helper see the same array", () => {
    alias = seen;
    emptied = append_twice(seen, "tail");
    assertTrue(emptied === 0, "the helper rebinds its own name only");
    assertTrue(alias.length === 5, json(alias));
    assertTrue(alias[4] === 'tail', json(alias));
  });

  step("push in a loop collects values", () => {
    squares = [];
    for (i = 1; i <= 3; i = i + 1) {
      squares.push(i * i);
    }
    assertTrue(json(squares) === '[1,4,9]', json(squares));
  });
}
