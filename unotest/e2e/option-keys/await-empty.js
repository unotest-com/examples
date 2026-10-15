// Two language nodes the interpreter runs (#526). `await` is allowed and
// never needed: a host call is awaited already, so `await f()` is f()'s
// value. It parses only inside an async function: here the step's callback. An empty statement (a lone `;`) does nothing.

function test_await_and_empty_statement() {
  step("await on a host call gives its value, as the call without it", async () => {
    const awaited = await formatNumber(1234.5);
    assertEqual(awaited, formatNumber(1234.5));
  });

  step("an empty statement changes nothing", () => {
    let n = 1;
    ;
    n = n + 1;;
    assertEqual(n, 2);
  });
}
