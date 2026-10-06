// #300: the page console in a scenario. Both pages come from mockRoute on an
// origin nobody serves, so every line and error below is one the page made:
// a noisy page that logs and throws on a click, and a quiet one — the
// control, where the same assertion must pass.

function noisy_page_html() {
  return '<p data-testid="state">idle</p><button id="go">Go</button>' +
    '<script>' +
    'console.log("booted");' +
    'document.getElementById("go").onclick = () => {' +
    ' console.warn("slow answer");' +
    ' console.error("save failed: 500");' +
    ' document.querySelector("[data-testid=state]").textContent = "clicked";' +
    ' throw new Error("kaput after save");' +
    '};' +
    '</script>';
}

function quiet_page_html() {
  return '<p data-testid="state">quiet</p><script>console.info("ready");</script>';
}

function test_console_entries_and_page_errors() {
  step("A quiet page: nothing to report", () => {
    mockRoute('https://quiet-page.unotest.test/', {body: quiet_page_html(), contentType: 'text/html'});
    goto('https://quiet-page.unotest.test/');
    assertText(getByTestId('state'), 'quiet');
    assertNoConsoleErrors();
    assertTrue(pageErrors().length == 0, json(pageErrors()));
    ready = consoleEntries({level: 'info'});
    assertTrue(ready.length == 1 && ready[0].text == 'ready', json(ready));
  });

  step("The noisy page logs and throws on a click, and all of it is there", () => {
    mockRoute('https://noisy-page.unotest.test/', {body: noisy_page_html(), contentType: 'text/html'});
    goto('https://noisy-page.unotest.test/');
    before = nowMs();
    click(getByRole('button', {name: 'Go'}));
    assertText(getByTestId('state'), 'clicked');
    errors = consoleEntries({level: 'error', since: before});
    assertTrue(errors.length == 1 && errors[0].text == 'save failed: 500', json(errors));
    assertTrue(errors[0].url == 'https://noisy-page.unotest.test/', json(errors));
    assertTrue(consoleEntries({level: ['warn', 'error']}).length == 2, json(consoleEntries()));
    thrown = pageErrors({since: before});
    assertTrue(thrown.length == 1 && thrown[0].message == 'kaput after save', json(thrown));
  });

  step("With since, what the click left is behind: nothing new since", () => {
    assertNoConsoleErrors({since: nowMs()});
    unmockRoute();
  });
}
