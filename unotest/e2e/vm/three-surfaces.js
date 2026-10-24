// #456: one test drives three surfaces — the host's web, a terminal in a
// VM, and the VM's browser — and lets go of all of them, red or green. Needs
// a Mac host with Tart and the clean-mac image (a key for the VM's account,
// Chrome, and its debugging port forwarded to 9223 on the VM's address); a
// host without a VM skips. The pages are mocked: what is under test is the
// surfaces working together, not an app.

function test_three_surfaces() {
  skip('no VM host', !vmAvailable());
  // A VM takes a minute to boot: the 5 minutes a test gets by default
  // do not hold the boot, an install and an agent's answer.
  setTestTimeout(900000);
  let ip;

  step("Boot a clean VM", () => {
    ip = vmRun(vmClone('clean-mac'));
  });

  step("A terminal in the VM prints a code, the host's page shows it", () => {
    openTerminal('Terminal', {host: 'admin@' + ip});
    terminalType('echo code-$((40 + 2))');
    terminalPress('Enter');
    const code = terminalWaitForText(/code-(\d+)/, {timeoutMs: 20000})[1];
    mockRoute('**/status', {contentType: 'text/html', body: '<p>agent says ' + code + '</p>'});
    goto('https://host-twin.test/status');
    assertVisible(getByText('agent says 42'));
  });

  step("The VM's browser is context 1 and answers too", () => {
    terminalType("open -gna 'Google Chrome' --args --remote-debugging-port=9222 --user-data-dir=/tmp/cdp about:blank");
    terminalPress('Enter');
    // -g keeps Chrome behind Terminal, or the next terminalType finds
    // Terminal not in front. `open` returns before Chrome listens: wait for the port, or
    // newContext races the browser's start. The marker is computed so the
    // typed command line itself does not match it.
    terminalType('until curl -fs -m1 127.0.0.1:9223/json/version >/dev/null; do sleep 1; done; echo cdp-$((40 + 2))-ready');
    terminalPress('Enter');
    terminalWaitForText('cdp-42-ready', {timeoutMs: 60000});
    newContext({cdpEndpoint: 'http://' + ip + ':9223'});
    mockRoute('**/status', {contentType: 'text/html', body: '<p>vm browser</p>'});
    goto('https://vm-twin.test/status');
    assertVisible(getByText('vm browser'));
    setContext(0);
  });

  step("Both surfaces in one wait", () => {
    terminalType('sleep 2; echo agent-answered');
    terminalPress('Enter');
    waitUntil(() => textContains(terminalText(), 'agent-answered') && isVisible(getByText('agent says 42')),
      {timeoutMs: 20000, label: 'terminal and web'});
  });
}
