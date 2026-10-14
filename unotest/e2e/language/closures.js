// Functions are values (#440): a closure keeps the variables of the call
// that made it, a callback writes the outer variable for real, a nested
// function is hoisted in its own body. The counter comes from the page,
// so the closure carries a value the browser produced.

function make_counter(start) {
  let n = start;
  return {
    next: () => {
      n += 1;
      return n;
    },
    peek() {
      return n;
    },
  };
}

function test_closures_keep_their_variables() {
  step("Two counters made from page text keep separate state", () => {
    goto("data:text/html,<p data-testid='start'>41</p>");
    const start = toNumber(getInnerText(getByTestId('start')));
    const a = make_counter(start);
    const b = make_counter(0);
    assertEqual(a.next(), 42);
    assertEqual(a.next(), 43);
    assertEqual(b.next(), 1);
    assertEqual(a.peek(), 43);
    assertEqual(b.peek(), 1);
  });

  step("A callback writes the variable outside it", () => {
    let total = 0;
    [1, 2, 3].forEach((x) => {
      total += x;
    });
    assertEqual(total, 6);
  });

  step("A nested function is hoisted and sees its parameters", () => {
    function twice(f, x) {
      return f(f(x));
    }
    const add = (k) => (x) => x + k;
    assertEqual(twice(add(5), 1), 11);
    assertEqual(square(7), 49);
    function square(x) {
      return x * x;
    }
  });

  step("Each loop turn captures its own let", () => {
    const getters = [];
    for (let i = 0; i < 3; i++) {
      getters.push(() => i);
    }
    assertEqual(getters.map((g) => g()), [0, 1, 2]);
  });
}
