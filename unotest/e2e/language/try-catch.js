// try / catch / finally and throw (#440). A thrown value is any value;
// a host error is caught as { name, message }; finally runs on every
// way out. A failure the scenario catches is not a failed test: the test
// stays green and the next step runs.

function read_or_default(target, fallback) {
  try {
    waitFor(target, { timeout: 500 });
    return getInnerText(target);
  } catch (e) {
    return fallback;
  } finally {
    note('read_or_default', 'tried');
  }
}

function test_try_catch_finally() {
  step("Catch a host error from a locator that is not there", () => {
    goto("data:text/html,<p data-testid='here'>present</p>");
    let caught = null;
    try {
      click(getByTestId('not-here'), { timeout: 500 });
    } catch (e) {
      caught = e;
    }
    assertTrue(caught !== null, 'the click should have thrown');
    assertEqual(typeof caught.name, 'string');
    assertTrue(caught.message.includes('not-here'), caught.message);
    assertEqual(read_or_default(getByTestId('here'), '-'), 'present');
    assertEqual(read_or_default(getByTestId('not-here'), '-'), '-');
  });

  step("Throw any value, finally runs on every way out", () => {
    const order = [];
    function run(kind) {
      try {
        order.push('try:' + kind);
        if (kind === 'throw') throw 'boom';
        if (kind === 'return') return 'early';
        order.push('end:' + kind);
      } catch (e) {
        order.push('catch:' + e);
      } finally {
        order.push('finally:' + kind);
      }
      return 'late';
    }
    assertEqual(run('throw'), 'late');
    assertEqual(run('return'), 'early');
    assertEqual(run('plain'), 'late');
    assertEqual(order, [
      'try:throw', 'catch:boom', 'finally:throw',
      'try:return', 'finally:return',
      'try:plain', 'end:plain', 'finally:plain',
    ]);
  });

  step("Catch without a binding, rethrow to the outer try", () => {
    let outer = '';
    try {
      try {
        throw { code: 1 };
      } catch {
        throw 'rethrown';
      }
    } catch (e) {
      outer = e;
    }
    assertEqual(outer, 'rethrown');
  });
}
