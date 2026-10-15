// Red twins (#449) of addVirtualAuthenticator's options: each option takes
// away something a page's navigator.credentials.create() asks for, so the
// key is not saved — the twin expects it saved and must fail with the
// page's own answer; the device without the option saves the same key next
// to it. A mocked page on the playground's origin, an https host name for
// the RP id.

function passkey_page() {
  return '<p data-testid="out">ready</p>' +
    // A passkey: a resident key and a verified user, from any device.
    '<button onclick="createKey(\'required\', \'required\', undefined, -7)">Create a passkey</button>' +
    // A key built into this device, nothing more.
    '<button onclick="createKey(\'discouraged\', \'discouraged\', \'platform\', -7)">Create a platform key</button>' +
    // A plain security key that signs with RSA, which U2F devices cannot.
    '<button onclick="createKey(\'discouraged\', \'discouraged\', undefined, -257)">Create an RSA key</button>' +
    '<script>' +
    'const out = (t) => { document.querySelector("[data-testid=out]").textContent = t; };' +
    'async function createKey(resident, uv, attachment, alg) { out("creating"); try { await navigator.credentials.create({publicKey: {challenge: new Uint8Array(16), rp: {name: "twins", id: location.hostname}, user: {id: new Uint8Array([7]), name: "ann", displayName: "Ann"}, pubKeyCredParams: [{type: "public-key", alg: alg}], timeout: 60000, authenticatorSelection: {residentKey: resident, userVerification: uv, authenticatorAttachment: attachment}}}); out("Passkey saved"); } catch (e) { out("create failed: " + e.name); } }' +
    '</script>';
}

function open_passkey_page() {
  mockRoute('**/twin-passkeys', {contentType: 'text/html', body: passkey_page()});
  goto('/twin-passkeys');
}

// The verdict that the device `key` saved what the button asks for; the
// device goes when the check ends, failed or not. The twin adds the device
// inside caught_message itself — that is where the coverage guard reads
// its options.
function key_saved(key, button) {
  try {
    click(getByRole('button', {name: button}));
    assertText(getByTestId('out'), 'Passkey saved', {timeoutMs: 1500});
  } finally {
    removeVirtualAuthenticator(key);
  }
}

function test_passkey_device_twins() {
  step("hasResidentKey: a device without resident keys cannot save a passkey", () => {
    open_passkey_page();
    assert_failed_with(caught_message(() => key_saved(addVirtualAuthenticator({hasResidentKey: false}), 'Create a passkey')), 'create failed: NotAllowedError');
    open_passkey_page();
    key_saved(addVirtualAuthenticator({hasResidentKey: true}), 'Create a passkey');
  });

  step("hasUserVerification: a device that cannot verify the user cannot save a passkey", () => {
    open_passkey_page();
    assert_failed_with(caught_message(() => key_saved(addVirtualAuthenticator({hasUserVerification: false}), 'Create a passkey')), 'create failed: NotAllowedError');
    open_passkey_page();
    key_saved(addVirtualAuthenticator({hasUserVerification: true}), 'Create a passkey');
  });

  step("isUserVerified: a user the device does not verify cannot save a passkey", () => {
    open_passkey_page();
    assert_failed_with(caught_message(() => key_saved(addVirtualAuthenticator({isUserVerified: false}), 'Create a passkey')), 'create failed: NotAllowedError');
    open_passkey_page();
    key_saved(addVirtualAuthenticator({isUserVerified: true}), 'Create a passkey');
  });

  step("automaticPresenceSimulation: without a touch the request waits", () => {
    open_passkey_page();
    assert_failed_with(caught_message(() => key_saved(addVirtualAuthenticator({automaticPresenceSimulation: false}), 'Create a passkey')), 'got "creating"');
    open_passkey_page();
    key_saved(addVirtualAuthenticator({automaticPresenceSimulation: true}), 'Create a passkey');
  });
}

function test_passkey_kind_twins() {
  step("transport: a USB key is not built into the device", () => {
    open_passkey_page();
    assert_failed_with(caught_message(() => key_saved(addVirtualAuthenticator({transport: 'usb'}), 'Create a platform key')), 'got "creating"');
    open_passkey_page();
    key_saved(addVirtualAuthenticator({transport: 'internal'}), 'Create a platform key');
  });

  step("protocol: a U2F key cannot sign with RSA, a CTAP2 key can", () => {
    open_passkey_page();
    assert_failed_with(caught_message(() => key_saved(addVirtualAuthenticator({protocol: 'u2f', transport: 'usb', hasResidentKey: false}), 'Create an RSA key')), 'create failed: NotAllowedError');
    open_passkey_page();
    key_saved(addVirtualAuthenticator({protocol: 'ctap2', transport: 'usb', hasResidentKey: false}), 'Create an RSA key');
  });
}
