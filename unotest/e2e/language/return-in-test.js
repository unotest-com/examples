// `return` (#440): inside a step it ends that step and the next step
// runs; in a helper and in a callback it gives the value back. A return
// directly in test_* is under step-coverage — the control is
// fixtures/out-of-language/return-in-test-body.js.

function first_word(text) {
  if (text.length === 0) return '';
  return text.split(' ')[0];
}

function test_return_ends_a_step() {
  let reached = [];
  step("A feature flag that is off ends the step early", () => {
    goto("data:text/html,<p data-testid='flag'>off</p><p data-testid='title'>Hello there</p>");
    reached.push('read');
    if (getInnerText(getByTestId('flag')) === 'off') {
      return;
    }
    reached.push('past the return');
    assertText(getByTestId('flag'), 'on');
  });

  step("The next step runs after the early return", () => {
    reached.push('next step');
    assertEqual(reached, ['read', 'next step']);
  });

  step("A helper and a callback return their values", () => {
    assertEqual(first_word(getInnerText(getByTestId('title'))), 'Hello');
    assertEqual(first_word(''), '');
    const lengths = ['ab', 'c'].map((s) => {
      return s.length;
    });
    assertEqual(lengths, [2, 1]);
  });
}
