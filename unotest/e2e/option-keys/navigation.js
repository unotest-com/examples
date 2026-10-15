// The options of goto / reload / goBack / goForward / waitForUrl / assertUrl
// (#526). The slow page's DOM is ready at once, but its `load` waits for an
// image the fixture server answers 6 s late (/delay). So a short
// {timeoutMs} fails a navigation that waits for `load` (the default), and
// {waitUntil: 'domcontentloaded'} with the same timeout passes: each key
// has its control in the other.
// Inline pages (data: URLs, so no `#` in them: that starts the fragment).

function slow_page_url() {
  return 'data:text/html,<p>slow page</p><img src="https://fixtures.unotest.com/delay?ms=6000">';
}

function fast_page_url() {
  return 'data:text/html,<p>fast page</p>';
}

function assert_timed_out(message) {
  assertTrue(textContains(message, 'Timeout 1500ms exceeded'), message);
}

function test_navigation_options_goto_reload() {
  step("goto: {timeoutMs: 1500} gives up on the slow load", () => {
    assert_timed_out(caught_message(() => goto(slow_page_url(), {timeoutMs: 1500})));
  });

  step("goto: {waitUntil: 'domcontentloaded'} with the same timeout returns", () => {
    goto(slow_page_url(), {waitUntil: 'domcontentloaded', timeoutMs: 1500});
    assertText(getByText('slow page'), 'slow page');
  });

  step("goto without timeoutMs waits the load out", () => {
    goto(slow_page_url());
    assertText(getByText('slow page'), 'slow page');
  });

  step("reload: {timeoutMs} gives up, {waitUntil: 'domcontentloaded'} returns, no key waits", () => {
    assert_timed_out(caught_message(() => reload({timeoutMs: 1500})));
    reload({waitUntil: 'domcontentloaded', timeoutMs: 1500});
    assertText(getByText('slow page'), 'slow page');
    reload();
  });
}

function test_navigation_options_history() {
  step("History: fast, then slow", () => {
    goto(fast_page_url());
    goto(slow_page_url(), {waitUntil: 'domcontentloaded'});
    goBack();
    assertText(getByText('fast page'), 'fast page');
  });

  step("goForward to the slow page: {timeoutMs} gives up, {waitUntil} returns", () => {
    assert_timed_out(caught_message(() => goForward({timeoutMs: 1500})));
    goBack();
    goForward({waitUntil: 'domcontentloaded', timeoutMs: 1500});
    assertText(getByText('slow page'), 'slow page');
  });

  step("goBack to the slow page: {timeoutMs} gives up, {waitUntil} returns", () => {
    goto(fast_page_url());
    assert_timed_out(caught_message(() => goBack({timeoutMs: 1500})));
    goForward();
    assertText(getByText('fast page'), 'fast page');
    goBack({waitUntil: 'domcontentloaded', timeoutMs: 1500});
    assertText(getByText('slow page'), 'slow page');
  });
}

function test_navigation_options_wait_for_url() {
  step("The URL is there at commit; waitForUrl waits for `load` too", () => {
    goto(slow_page_url(), {waitUntil: 'commit'});
    assert_timed_out(caught_message(() => waitForUrl('slow', {timeoutMs: 1500})));
  });

  step("{waitUntil: 'domcontentloaded'} returns within the same timeout", () => {
    waitForUrl('slow', {waitUntil: 'domcontentloaded', timeoutMs: 1500});
    assertText(getByText('slow page'), 'slow page');
  });
}

// A page cannot move its own data: URL, even the fragment (Chromium: "Not
// allowed to navigate top frame to data URL"), so assertUrl waits on the
// catalog's slow route, as catalog/delayed-navigation does.
function test_navigation_options_assert_url() {
  step("Open the catalog tree with a 3 s navigation delay", () => {
    goto(textJoin(['/scenarios/catalog/tree?type=K&seed=', CATALOG_SEED, '&latency=3000']));
    setLocalStorage('kitfinder_cookie_consent', 'ok');
    reload();
    waitForText('Space Rangers');
  });

  step("assertUrl {timeoutMs: 1500} gives up before the route lands", () => {
    click(getByRole('link', {name: 'Space Rangers Junior Cadets', exact: true}));
    const message = caught_message(() => assertUrl('catString=', {timeoutMs: 1500}));
    assertTrue(textContains(message, 'catString='), message);
  });

  step("{timeoutMs: 6000} sees it land", () => {
    assertUrl('catString=', {timeoutMs: 6000});
  });
}
