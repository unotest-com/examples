// addVirtualAuthenticator / virtualCredentials / removeVirtualAuthenticator,
// grantPermissions and setOffline (#320). The playground has no passkey
// sign-in, so a mocked page on its origin (https, a host name for the RP id)
// carries one; every step is a real click on it.

function fixture_page() {
  return '<p id="out">ready</p>' +
    '<button onclick="createKey()">Create a passkey</button>' +
    '<button onclick="signIn()">Sign in with a passkey</button>' +
    '<button onclick="checkNotifications()">Check notifications</button>' +
    '<button onclick="checkGeolocation()">Check geolocation</button>' +
    '<button onclick="ping()">Ping</button>' +
    '<script>' +
    'const out = (t) => { document.getElementById("out").textContent = t; };' +
    'const rpId = location.hostname;' +
    'async function createKey() { try { await navigator.credentials.create({publicKey: {challenge: new Uint8Array(16), rp: {name: "dogfood", id: rpId}, user: {id: new Uint8Array([7, 7]), name: "ann", displayName: "Ann"}, pubKeyCredParams: [{type: "public-key", alg: -7}], authenticatorSelection: {residentKey: "required", userVerification: "required"}}}); out("Passkey saved"); } catch (e) { out("create failed: " + e.name); } }' +
    'async function signIn() { try { await navigator.credentials.get({publicKey: {challenge: new Uint8Array(16), rpId: rpId, userVerification: "required"}}); out("Welcome back"); } catch (e) { out("sign-in failed: " + e.name); } }' +
    'async function checkNotifications() { const s = await navigator.permissions.query({name: "notifications"}); out("notifications: " + s.state); }' +
    'async function checkGeolocation() { const s = await navigator.permissions.query({name: "geolocation"}); out("geolocation granted: " + (s.state === "granted")); }' +
    'async function ping() { try { await fetch("/", {cache: "no-store"}); out("online"); } catch (e) { out("offline"); } }' +
    '</script>';
}

function test_passkey_without_a_device() {
  step("Open the sign-in page", () => {
    mockRoute('**/passkey-fixture', {contentType: 'text/html', body: fixture_page()});
    goto('/passkey-fixture');
  });

  step("Create a passkey on a virtual authenticator and sign in with it", () => {
    const key = addVirtualAuthenticator();
    click(getByRole('button', {name: 'Create a passkey'}));
    waitForText('Passkey saved');
    click(getByRole('button', {name: 'Sign in with a passkey'}));
    waitForText('Welcome back');

    const creds = virtualCredentials(key);
    assertTrue(creds.length == 1, json(creds));
    assertTrue(creds[0].rpId == 'playground.unotest.com', json(creds[0]));
    assertTrue(creds[0].resident, 'a passkey is a resident credential');
    assertTrue(creds[0].signCount >= 1, json(creds[0]));
    removeVirtualAuthenticator(key);
  });

  step("Every option spelled out is the same device passkey", () => {
    const key = addVirtualAuthenticator({
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    });
    click(getByRole('button', {name: 'Create a passkey'}));
    waitForText('Passkey saved');
    assertTrue(virtualCredentials(key).length == 1, json(virtualCredentials(key)));
    removeVirtualAuthenticator(key);
  });
}

function test_permissions_and_offline() {
  step("Open the page", () => {
    mockRoute('**/passkey-fixture', {contentType: 'text/html', body: fixture_page()});
    goto('/passkey-fixture');
  });

  step("Notifications are granted on request", () => {
    grantPermissions(['notifications']);
    click(getByRole('button', {name: 'Check notifications'}));
    waitForText('notifications: granted');
  });

  step("A grant for another origin leaves this page without it", () => {
    grantPermissions(['geolocation'], {origin: 'https://elsewhere.example'});
    click(getByRole('button', {name: 'Check geolocation'}));
    waitForText('geolocation granted: false');
    grantPermissions(['geolocation'], {origin: 'https://playground.unotest.com'});
    click(getByRole('button', {name: 'Check geolocation'}));
    waitForText('geolocation granted: true');
  });

  step("Offline cuts the network, online brings it back", () => {
    setOffline(true);
    click(getByRole('button', {name: 'Ping'}));
    waitForText('offline');
    setOffline(false);
    click(getByRole('button', {name: 'Ping'}));
    waitForText('online');
  });
}
