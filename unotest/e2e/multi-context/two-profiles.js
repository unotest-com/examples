// Two devices of one app, side by side: context 0 is the run's own browser,
// A and B each sit on a browser profile of their own (newContext({profile})).
// A device keeps what it stored, the other does not see it, and the
// directories survive the run — each device writes only its own name, so
// the check holds on a second run over the same directories.

const PAGE = {contentType: 'text/html', body: '<!doctype html><title>device</title><p>device page</p>'};

function open_device_page() {
  mockRoute('**/device', PAGE);
  goto('https://device-twin.test/device');
}

function test_two_devices_keep_their_own_storage() {
  let deviceA;
  let deviceB;
  step("Device A opens its page and stores its name", () => {
    deviceA = newContext({profile: 'unotest/.runs/two-profiles/a'});
    open_device_page();
    setLocalStorage('device', 'A');
  });

  step("Device B has a profile of its own, and A's name is not in it", () => {
    deviceB = newContext({profile: 'unotest/.runs/two-profiles/b'});
    open_device_page();
    assertEqual(getLocalStorage('device') !== 'A', true);
    setLocalStorage('device', 'B');
  });

  step("Back to A: its storage is where A left it", () => {
    setContext(deviceA);
    reload();
    assertEqual(getLocalStorage('device'), 'A');
  });

  step("And B reads its own", () => {
    setContext(deviceB);
    reload();
    assertEqual(getLocalStorage('device'), 'B');
  });
}
