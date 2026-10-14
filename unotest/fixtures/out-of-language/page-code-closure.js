// @expect-fail
// Refused by lint (#440, plan §7): page code that reads a variable of the
// scenario. The pair of feedback-rewrites/page-code-status-rows.js, which
// passes the value as an argument. Lint refuses it with
// validator:page-code-closure; a run that skips lint sends the function
// to the page, where the name is not defined.
// Run by scripts/dogfood-expect-fail.mjs.

function test_page_code_closure_is_refused() {
  step("Open a page", () => {
    goto("data:text/html,<p>x</p>");
  });
  step("Read a scenario variable in page code", () => {
    const wanted = 'x';
    note('found', evaluate(() => document.body.textContent === wanted));
  });
}
