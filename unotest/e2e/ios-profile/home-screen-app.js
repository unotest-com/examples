// profile: "ios" (#318) — runs only under the iOS collection, which turns
// the profile on. A mocked page on the playground's origin reports what the
// app's own scripts see: the engine, the phone, the launch mode.

function fixture_page() {
  return '<meta name="viewport" content="width=device-width">' +
    '<p id="out">ready</p>' +
    '<button onclick="probe()">Where am I running</button>' +
    '<script>' +
    'function probe() {' +
    '  const facts = [' +
    '    "standalone=" + matchMedia("(display-mode: standalone)").matches,' +
    '    "tab=" + matchMedia("(display-mode: browser)").matches,' +
    '    "home-screen=" + navigator.standalone,' +
    '    "iphone=" + navigator.userAgent.includes("iPhone"),' +
    '    "touch=" + ("ontouchstart" in window),' +
    '    "width=" + innerWidth,' +
    '    "portrait=" + matchMedia("(orientation: portrait)").matches,' +
    '  ];' +
    '  document.getElementById("out").textContent = facts.join(" ");' +
    '}' +
    '</script>';
}

function test_app_opened_from_the_home_screen() {
  step("Open the app", () => {
    mockRoute('**/ios-fixture', {contentType: 'text/html', body: fixture_page()});
    goto('/ios-fixture');
  });

  step("The app sees an iPhone and a home-screen launch", () => {
    click(getByRole('button', {name: 'Where am I running'}));
    waitForText('standalone=true tab=false home-screen=true');
    waitForText('iphone=true touch=true width=393');
    // Every other media query is the engine's own.
    waitForText('portrait=true');
  });
}
