// The options of setCookie (#526), each read from both sides: getCookie
// reads the browser context's jar (every domain and path, httpOnly too),
// document.cookie is what the page at / is given. A key that narrows the
// cookie shows as a gap between the two; its control is the same cookie
// without the key, on both. A cookie the jar lacks reads as ''.

function page_cookies() {
  return evaluate(() => document.cookie);
}

function test_set_cookie_options() {
  step("Open the playground: cookies need a real origin", () => {
    goto('/');
  });

  step("No options: the jar has it and so does the page", () => {
    setCookie('plain', '1');
    assertEqual(getCookie('plain'), '1');
    assertTrue(textContains(page_cookies(), 'plain=1'), page_cookies());
  });

  step("{path: '/nowhere'}: in the jar, not given to the page at /", () => {
    setCookie('pathed', '1', {path: '/nowhere'});
    assertEqual(getCookie('pathed'), '1');
    assertTrue(!textContains(page_cookies(), 'pathed='), page_cookies());
  });

  step("{domain: 'example.com'}: in the jar, not given to the playground", () => {
    setCookie('elsewhere', '1', {domain: 'example.com'});
    assertEqual(getCookie('elsewhere'), '1');
    assertTrue(!textContains(page_cookies(), 'elsewhere='), page_cookies());
  });

  step("{httpOnly: true}: in the jar, hidden from the page's script", () => {
    setCookie('server_only', '1', {httpOnly: true});
    assertEqual(getCookie('server_only'), '1');
    assertTrue(!textContains(page_cookies(), 'server_only='), page_cookies());
  });

  step("{expires} in the past drops the cookie; in the future keeps it", () => {
    setCookie('stale', '1', {expires: 1});
    assertEqual(getCookie('stale'), '');
    setCookie('fresh', '1', {expires: 4102444800});
    assertEqual(getCookie('fresh'), '1');
  });

  step("{sameSite: 'None'} without secure is dropped without a word; {secure: true} lets it in", () => {
    setCookie('cross', '1', {sameSite: 'None'});
    assertEqual(getCookie('cross'), '');
    setCookie('cross', '1', {sameSite: 'None', secure: true});
    assertEqual(getCookie('cross'), '1');
    assertTrue(textContains(page_cookies(), 'cross=1'), page_cookies());
  });
}
