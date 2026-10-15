// setPageHidden(hidden) — the tab in the background as the page's scripts
// see it: document.hidden, visibilityState, blur + visibilitychange. The
// client's case: a chat, another tab for a while, back — and the message
// that came meanwhile is announced. Inline (a data: URL), because the
// playground has no page that listens to visibilitychange.

function chat_page_url() {
  return 'data:text/html,<style>body{font:24px sans-serif;margin:40px}</style>' +
    '<div data-testid="state"></div><div data-testid="log"></div>' +
    '<div data-testid="unread">0 unread</div><div data-testid="banner"></div>' +
    '<script>let unread = 0; const log = [];' +
    ' const $ = (id) => document.querySelector("[data-testid=" + id + "]");' +
    ' const show = () => { $("state").textContent = document.visibilityState;' +
    '   $("log").textContent = log.join(",") || "no events"; };' +
    ' addEventListener("blur", () => { log.push("blur"); show(); });' +
    ' document.addEventListener("visibilitychange", () => {' +
    '   log.push("visibilitychange:" + document.visibilityState); show();' +
    '   if (document.hidden) { setTimeout(() => { if (document.hidden) {' +
    '     unread++; $("unread").textContent = unread + " unread"; } }, 200); }' +
    '   else if (unread > 0) { $("banner").textContent = unread + " new while away"; } });' +
    ' show();</script>';
}

function test_page_hidden_chat_in_background() {
  step("The chat opens visible, no event yet", () => {
    goto(chat_page_url());
    assertText(getByTestId('state'), 'visible');
    assertText(getByTestId('log'), 'no events');
  });

  step("setPageHidden(true): hidden, blur then visibilitychange", () => {
    setPageHidden(true);
    assertText(getByTestId('state'), 'hidden');
    assertText(getByTestId('log'), 'blur,visibilitychange:hidden');
  });

  step("A message comes while the tab is in the background", () => {
    waitFor(getByText('1 unread'));
    assertText(getByTestId('banner'), '');
  });

  step("setPageHidden(false): visible again, the chat announces it", () => {
    setPageHidden(false);
    assertText(getByTestId('state'), 'visible');
    assertText(getByTestId('log'), 'blur,visibilitychange:hidden,visibilitychange:visible');
    assertText(getByTestId('banner'), '1 new while away');
  });
}

function test_page_hidden_holds_across_navigation() {
  step("Hidden, then the tab opens the chat again", () => {
    goto(chat_page_url());
    setPageHidden(true);
    goto(chat_page_url());
  });

  step("The new document starts hidden, with no visibilitychange of its own", () => {
    assertText(getByTestId('state'), 'hidden');
    assertText(getByTestId('log'), 'no events');
  });

  step("setPageHidden(false) shows it", () => {
    setPageHidden(false);
    assertText(getByTestId('state'), 'visible');
    assertText(getByTestId('log'), 'visibilitychange:visible');
  });
}
