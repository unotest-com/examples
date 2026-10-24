// Red twins (#449) of the options that set up or read the page's state:
// the window, the media, the console, the permissions. Each option
// changes what the page shows or what the reader returns, so the twin
// expects the state without the option and must fail with the option's
// own result in the message; the same call checked against that result
// passes next to it. Mocked pages on the playground's origin.

function state_page() {
  return '<p data-testid="size"></p><p data-testid="media"></p><p data-testid="geo"></p>' +
    '<button onclick="console.warn(\'twin-warn\'); console.error(\'twin-error\')">Log</button>' +
    '<button onclick="setTimeout(() => { throw new Error(\'twin-thrown\'); })">Throw</button>' +
    '<button onclick="checkGeo()">Check geolocation</button>' +
    '<button onclick="document.body.style.height = \'2000px\'">Grow</button>' +
    '<script>' +
    'const show = (id, t) => { document.querySelector("[data-testid=" + id + "]").textContent = t; };' +
    'const size = () => show("size", "size " + innerWidth + "x" + innerHeight);' +
    'const dark = matchMedia("(prefers-color-scheme: dark)");' +
    'const still = matchMedia("(prefers-reduced-motion: reduce)");' +
    'const media = () => show("media", (dark.matches ? "dark" : "light") + " " + (still.matches ? "still" : "moving"));' +
    'async function checkGeo() { const s = await navigator.permissions.query({name: "geolocation"}); show("geo", "geolocation " + s.state); }' +
    'addEventListener("resize", size); dark.onchange = media; still.onchange = media; size(); media();' +
    '</script>';
}

function open_state_page() {
  mockRoute('**/twin-state', {contentType: 'text/html', body: state_page()});
  goto('/twin-state');
}

function test_window_twins() {
  step("Open the page", () => { open_state_page(); });

  step("setViewport width and height: the page sees the new size, not the old one", () => {
    const before = getInnerText(getByTestId('size'));
    assert_failed_with(caught_message(() => {
      setViewport({width: 420, height: 640});
      assertText(getByTestId('size'), before, {timeoutMs: 500});
    }), 'size 420x640');
    assertText(getByTestId('size'), 'size 420x640');
  });

  step("screenshot fullPage: the picture is as tall as the page, not the window", () => {
    setViewport({width: 420, height: 640});
    click(getByRole('button', {name: 'Grow'}));
    const windowHeight = readFileInfo(screenshot('twin-window')).png.height;
    assert_failed_with(caught_message(() => assertEqual(readFileInfo(screenshot('twin-full', {fullPage: true})).png.height, windowHeight)), 'expected ' + windowHeight);
    assertTrue(readFileInfo(screenshot('twin-full', {fullPage: true})).png.height > windowHeight, 'a full-page picture no taller than the window');
  });
}

function test_media_twins() {
  step("Open the page in light mode, with motion", () => {
    emulateMedia({colorScheme: 'light', reducedMotion: 'no-preference'});
    open_state_page();
    assertText(getByTestId('media'), 'light moving');
  });

  step("colorScheme: dark is what the page sees after it", () => {
    assert_failed_with(caught_message(() => {
      emulateMedia({colorScheme: 'dark'});
      assertText(getByTestId('media'), 'light moving', {timeoutMs: 500});
    }), 'dark moving');
  });

  step("reducedMotion: reduce is what the page sees after it", () => {
    assert_failed_with(caught_message(() => {
      emulateMedia({reducedMotion: 'reduce'});
      assertText(getByTestId('media'), 'dark moving', {timeoutMs: 500});
    }), 'dark still');
  });
}

function test_console_reader_twins() {
  step("Open the page and log a warning and an error", () => {
    open_state_page();
    click(getByRole('button', {name: 'Log'}));
  });

  step("consoleEntries level: errors only leave the warning out", () => {
    assert_failed_with(caught_message(() => assertEqual(consoleEntries({level: 'error'}).length, 2)), 'got 1');
    assertEqual(consoleEntries({level: 'error'})[0].text, 'twin-error');
  });

  step("consoleEntries since: lines before it are left out", () => {
    const after = nowMs();
    assert_failed_with(caught_message(() => assertEqual(consoleEntries({since: after}).length, 2)), 'got 0');
    click(getByRole('button', {name: 'Log'}));
    assertEqual(consoleEntries({since: after}).length, 2);
  });

  step("pageErrors since: an error before it is left out", () => {
    click(getByRole('button', {name: 'Throw'}));
    waitUntil(() => pageErrors().length > 0, {timeoutMs: 3000});
    const after = nowMs();
    assert_failed_with(caught_message(() => assertEqual(pageErrors({since: after}).length, 1)), 'got 0');
    click(getByRole('button', {name: 'Throw'}));
    waitUntil(() => pageErrors({since: after}).length > 0, {timeoutMs: 3000});
  });
}

function net_page() {
  return '<button onclick="fetch(\'/twin-api\')">Fetch A</button><button onclick="fetch(\'/twin-other\')">Fetch B</button>';
}

function test_network_reader_twins() {
  step("Open the page and fetch from it", () => {
    mockRoute('**/twin-net', {contentType: 'text/html', body: net_page()});
    mockRoute('**/twin-api', {body: {ok: true}});
    mockRoute('**/twin-other', {body: {ok: true}});
    goto('/twin-net');
    click(getByRole('button', {name: 'Fetch A'}));
    waitUntil(() => networkEntries({glob: '**/twin-api'}).length > 0, {timeoutMs: 3000});
  });

  step("networkEntries since: a request before it is left out", () => {
    const after = nowMs();
    assert_failed_with(caught_message(() => assertEqual(networkEntries({since: after, glob: '**/twin-api'}).length, 1)), 'got 0');
    click(getByRole('button', {name: 'Fetch A'}));
    waitUntil(() => networkEntries({since: after, glob: '**/twin-api'}).length > 0, {timeoutMs: 3000});
    assertEqual(networkEntries({since: after, glob: '**/twin-api'}).length, 1);
  });

  step("networkEntries glob: another URL is left out", () => {
    click(getByRole('button', {name: 'Fetch B'}));
    waitUntil(() => networkEntries({glob: '**/twin-other'}).length > 0, {timeoutMs: 3000});
    assert_failed_with(caught_message(() => assertEqual(networkEntries({glob: '**/twin-other'}).length, 3)), 'got 1');
    assertEqual(networkEntries({glob: '**/twin-other'}).length, 1);
  });
}

function test_permission_twins() {
  step("Open the page", () => { open_state_page(); });

  step("grantPermissions origin: a grant for another origin leaves this page without it", () => {
    assert_failed_with(caught_message(() => {
      grantPermissions(['geolocation'], {origin: 'https://elsewhere.example'});
      click(getByRole('button', {name: 'Check geolocation'}));
      assertText(getByTestId('geo'), 'geolocation granted', {timeoutMs: 500});
    }), 'geolocation denied');
    grantPermissions(['geolocation'], {origin: 'https://playground.unotest.com'});
    click(getByRole('button', {name: 'Check geolocation'}));
    assertText(getByTestId('geo'), 'geolocation granted');
  });
}
