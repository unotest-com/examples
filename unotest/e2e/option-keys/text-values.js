// The options of waitForText, formatNumber and toNumber (#526). Each key
// beside its control: the same call without it reads differently.
// Inline page (a data: URL, so no `#` in it: that starts the fragment).

function text_page_url() {
  return 'data:text/html,<p>Saved</p><p id="busy">Loading</p>' +
    '<script>setTimeout(() => document.getElementById("busy").remove(), 4000);</script>';
}

function test_wait_for_text_options() {
  step("Open the page: 'Saved' and, for 4 s, 'Loading'", () => {
    goto(text_page_url());
  });

  step("'Save' is a substring of 'Saved': found; {exact: true} gives up", () => {
    waitForText('Save', {timeoutMs: 700});
    const message = caught_message(() => waitForText('Save', {exact: true, timeoutMs: 700}));
    assertTrue(textContains(message, 'Timeout 700ms exceeded'), message);
    waitForText('Saved', {exact: true, timeoutMs: 700});
  });

  step("A plain wait returns while 'Loading' is up; {state: 'hidden'} waits it out", () => {
    waitForText('Loading');
    assertCount(getByText('Loading'), 1);
    waitForText('Loading', {state: 'hidden', timeoutMs: 5000});
    assertCount(getByText('Loading'), 0);
  });
}

function test_number_options() {
  step("formatNumber: the default grouping, then {locale: 'de-DE'}", () => {
    assertEqual(formatNumber(1234.5), '1,234.5');
    assertEqual(formatNumber(1234.5, {locale: 'de-DE'}), '1.234,5');
  });

  step("toNumber: '1.234' is refused as ambiguous; {decimal} decides", () => {
    const message = caught_message(() => toNumber('1.234'));
    assertTrue(textContains(message, 'is ambiguous'), message);
    assertEqual(toNumber('1.234', {decimal: ','}), 1234);
    assertEqual(toNumber('1.234', {decimal: '.'}), 1.234);
  });
}
