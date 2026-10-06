// @expect-fail
// Deliberate failure: assertText with {not: true} on a text that never
// changes must fail at the timeout and quote the text that still matches,
// not pass because the first read happened to be taken too early.

function test_assert_text_not_reports_what_stayed() {
  step("Wait for a status that never stops saying Saving", () => {
    goto("data:text/html;charset=utf-8,<p role='status'>Saving…</p>");
    assertText(getByRole('status'), 'Saving', {not: true, exact: false, timeout: 1500});
  });
}
