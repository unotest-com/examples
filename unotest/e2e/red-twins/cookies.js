// Red twins (#449) of setCookie's options: each option decides whether a
// page can read the cookie, so the twin sets it, reloads, and expects the
// page to show it — which must fail with the page showing none; the same
// cookie with the option the other way shows up next to it. Mocked pages
// on hosts of their own: a-twin.test for the page, b-twin.test for a
// cross-site frame, plain http for the secure flag.

function cookie_page() {
  return '<p data-testid="cookies"></p>' +
    '<script>document.querySelector("[data-testid=cookies]").textContent = "cookies: " + (document.cookie || "none");</script>' +
    '<iframe src="https://b-twin.test/twin-cookies"></iframe>';
}

function open_cookie_page(url) {
  mockRoute('**/twin-cookies', {contentType: 'text/html', body: cookie_page()});
  goto(url);
}

function page_shows(text) {
  reload();
  assertText(getByTestId('cookies'), text, {exact: false, timeoutMs: 500});
}

// What the cross-site frame reads: a third-party context, where SameSite
// decides.
function frame_shows(text) {
  reload();
  enterFrame(locator('iframe'));
  try {
    assertText(getByTestId('cookies'), text, {exact: false, timeoutMs: 500});
  } finally {
    exitFrame();
  }
}

function test_cookie_domain_and_path_twins() {
  step("Open the page", () => { open_cookie_page('https://a-twin.test/twin-cookies'); });

  step("domain: a cookie for another site is not the page's, its own domain is", () => {
    assert_failed_with(caught_message(() => {
      setCookie('twin_domain', 'v', {domain: 'b-twin.test'});
      page_shows('twin_domain=v');
    }), 'cookies: none');
    setCookie('twin_domain', 'v', {domain: 'a-twin.test'});
    page_shows('twin_domain=v');
  });

  step("path: a cookie for another path is not the page's, the root path is", () => {
    assert_failed_with(caught_message(() => {
      setCookie('twin_path', 'v', {path: '/elsewhere'});
      page_shows('twin_path=v');
    }), 'twin_domain=v');
    setCookie('twin_path', 'v', {path: '/'});
    page_shows('twin_path=v');
  });
}

function test_cookie_lifetime_and_script_twins() {
  step("Open the page", () => { open_cookie_page('https://a-twin.test/twin-cookies'); });

  step("expires: a cookie expired in 1970 is gone, one for the next hour stays", () => {
    assert_failed_with(caught_message(() => {
      setCookie('twin_expires', 'v', {expires: 1});
      page_shows('twin_expires=v');
    }), 'cookies: none');
    setCookie('twin_expires', 'v', {expires: round(nowMs() / 1000) + 3600});
    page_shows('twin_expires=v');
  });

  step("httpOnly: the page cannot read it though the browser has it, without it the page can", () => {
    assert_failed_with(caught_message(() => {
      setCookie('twin_http_only', 'v', {httpOnly: true});
      page_shows('twin_http_only=v');
    }), 'twin_expires=v');
    assertEqual(getCookie('twin_http_only'), 'v');
    setCookie('twin_http_only', 'v', {httpOnly: false});
    page_shows('twin_http_only=v');
  });
}

function test_cookie_secure_twins() {
  step("Open a plain http page", () => { open_cookie_page('http://c-twin.test/twin-cookies'); });

  step("secure: a plain http page does not get it, without the flag it does", () => {
    assert_failed_with(caught_message(() => {
      setCookie('twin_secure', 'v', {domain: 'c-twin.test', secure: true});
      page_shows('twin_secure=v');
    }), 'cookies: none');
    setCookie('twin_secure', 'v', {domain: 'c-twin.test', secure: false});
    page_shows('twin_secure=v');
  });
}

function test_cookie_same_site_twins() {
  step("Open the page with its cross-site frame", () => { open_cookie_page('https://a-twin.test/twin-cookies'); });

  step("sameSite: a Lax cookie stays out of a cross-site frame, None goes in", () => {
    assert_failed_with(caught_message(() => {
      setCookie('twin_same_site', 'v', {domain: 'b-twin.test', sameSite: 'Lax', secure: true});
      frame_shows('twin_same_site=v');
    }), 'cookies: none');
    setCookie('twin_same_site', 'v', {domain: 'b-twin.test', sameSite: 'None', secure: true});
    frame_shows('twin_same_site=v');
  });
}
