// Red twins (#449) of {waitUntil} on goto, reload, goBack, goForward and
// waitForUrl. The slow page's DOM is ready at once, but its `load` waits
// for an image the fixture server answers 6 s late. So {waitUntil:
// 'load'} with a short timeoutMs fails naming the event it waited for, and
// {waitUntil: 'domcontentloaded'} with the same timeout returns: each key
// value is the other's control. waitForUrl's failure does not name the
// event it waited for: its twin reads the timeout of the call.
// Inline pages (data: URLs, so no `#` in them: that starts the fragment).

function slow_page() {
  return 'data:text/html,<p>slow page</p><img src="https://fixtures.unotest.com/delay?ms=6000">';
}

function fast_page() {
  return 'data:text/html,<p>fast page</p>';
}

function test_goto_and_reload_wait_until_twins() {
  step("Twin: goto {waitUntil: 'load'} gives up on the slow load", () => {
    assert_failed_with(caught_message(() => goto(slow_page(), {waitUntil: 'load', timeoutMs: 1500})), 'until "load"');
  });

  step("Control: goto {waitUntil: 'domcontentloaded'} returns within the same timeout", () => {
    goto(slow_page(), {waitUntil: 'domcontentloaded', timeoutMs: 1500});
    assertText(getByText('slow page'), 'slow page');
  });

  step("Twin: reload {waitUntil: 'load'} gives up on the slow load", () => {
    assert_failed_with(caught_message(() => reload({waitUntil: 'load', timeoutMs: 1500})), 'until "load"');
  });

  step("Control: reload {waitUntil: 'domcontentloaded'} returns", () => {
    reload({waitUntil: 'domcontentloaded', timeoutMs: 1500});
    assertText(getByText('slow page'), 'slow page');
  });
}

function test_history_wait_until_twins() {
  step("History: fast, then slow", () => {
    goto(fast_page());
    goto(slow_page(), {waitUntil: 'domcontentloaded'});
    goBack();
    assertText(getByText('fast page'), 'fast page');
  });

  step("Twin: goForward {waitUntil: 'load'} gives up on the slow page", () => {
    assert_failed_with(caught_message(() => goForward({waitUntil: 'load', timeoutMs: 1500})), 'until "load"');
  });

  step("Control: goForward {waitUntil: 'domcontentloaded'} returns", () => {
    goBack();
    goForward({waitUntil: 'domcontentloaded', timeoutMs: 1500});
    assertText(getByText('slow page'), 'slow page');
  });

  step("Twin: goBack {waitUntil: 'load'} to the slow page gives up", () => {
    goto(fast_page());
    assert_failed_with(caught_message(() => goBack({waitUntil: 'load', timeoutMs: 1500})), 'until "load"');
  });

  step("Control: goBack {waitUntil: 'domcontentloaded'} returns", () => {
    goForward();
    assertText(getByText('fast page'), 'fast page');
    goBack({waitUntil: 'domcontentloaded', timeoutMs: 1500});
    assertText(getByText('slow page'), 'slow page');
  });
}

function test_wait_for_url_wait_until_twin() {
  step("Twin: the URL is there at commit, waitForUrl {waitUntil: 'load'} still waits", () => {
    goto(slow_page(), {waitUntil: 'commit'});
    assert_failed_with(caught_message(() => waitForUrl('slow', {waitUntil: 'load', timeoutMs: 1500})), 'waitForURL: Timeout 1500ms exceeded');
  });

  step("Control: waitForUrl {waitUntil: 'domcontentloaded'} returns", () => {
    waitForUrl('slow', {waitUntil: 'domcontentloaded', timeoutMs: 1500});
    assertText(getByText('slow page'), 'slow page');
  });
}
