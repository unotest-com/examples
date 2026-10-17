// An empty statement (a lone `;`) does nothing (#526). `await` left the
// language: a DSL call returns its result, and `async` / `await` are a lint
// error (fixture unotest/fixtures/out-of-language/async-await.js).

function test_empty_statement() {
  step("an empty statement changes nothing", () => {
    let n = 1;
    ;
    n = n + 1;;
    assertEqual(n, 2);
  });
}
