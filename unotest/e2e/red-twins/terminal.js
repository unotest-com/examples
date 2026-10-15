// Red twins (#449) of the terminal steps' options, in a real Terminal.app
// window. macOS only, and a local run takes the keyboard — not in the
// dogfood collection, like terminal/terminal-app. A wait for text that
// never comes, or for text that never goes, must fail by its own
// timeoutMs, well before the default; {not} must turn a passing check
// into a failing one. The same call on the right screen passes next to
// each. Typed text is read back from the screen before Enter: under a
// keyboard layout that changes it, the twin fails in seconds on what
// arrived, not by waiting for a command that never ran.

function open_echo_window() {
  openTerminal('Terminal');
  terminalType('clear; echo twin-ready');
  terminalAssertText('clear; echo twin-ready', {timeoutMs: 2000});
  terminalPress('Enter');
  terminalWaitForText('twin-ready');
}

function test_terminal_wait_twins() {
  step("Open a window that printed twin-ready", () => { open_echo_window(); });

  step("terminalWaitForText timeoutMs: text that never comes fails in time", () => {
    const started = nowMs();
    assert_failed_with(caught_message(() => terminalWaitForText('never-printed', {timeoutMs: 300})), 'never-printed');
    assert_failed_in_time(started, 'terminalWaitForText');
    terminalWaitForText('twin-ready', {timeoutMs: 300});
  });

  step("terminalWaitForText not: text on the screen never goes, text that is not there has", () => {
    assert_failed_with(caught_message(() => terminalWaitForText('twin-ready', {not: true, timeoutMs: 300})), 'twin-ready');
    terminalWaitForText('never-printed', {not: true, timeoutMs: 300});
  });

  step("terminalAssertText timeoutMs: text that never comes fails in time", () => {
    const started = nowMs();
    assert_failed_with(caught_message(() => terminalAssertText('never-printed', {timeoutMs: 300})), 'never-printed');
    assert_failed_in_time(started, 'terminalAssertText');
    terminalAssertText('twin-ready', {timeoutMs: 300});
  });

  step("terminalAssertText not: text on the screen fails it, text that is not there passes", () => {
    assert_failed_with(caught_message(() => terminalAssertText('twin-ready', {not: true, timeoutMs: 300})), 'twin-ready');
    terminalAssertText('never-printed', {not: true, timeoutMs: 300});
  });
}

function test_terminal_host_twins() {
  step("host: a Mac that takes no ssh key opens no window, this Mac does", () => {
    assert_failed_with(caught_message(() => openTerminal('Terminal', {host: 'twin@127.0.0.1'})), 'twin@127.0.0.1');
    open_echo_window();
  });
}

function test_terminal_type_echo_twins() {
  step("terminalType echo: text a program does not echo fails the wait, {echo: false} types it", () => {
    open_echo_window();
    // bash echoes what is typed at its prompt itself; `read -s` does not.
    terminalType('read -s H; echo "got-$H"');
    terminalPress('Enter');
    assert_failed_with(caught_message(() => terminalType('twin-hidden', {echo: true})), 'did not show the typed text');
    terminalPress('Enter');
    terminalWaitForText('got-twin-hidden', {timeoutMs: 2000});
    terminalType('read -s H; echo "blind-$H"');
    terminalPress('Enter');
    terminalType('twin-typed', {echo: false});
    terminalPress('Enter');
    terminalWaitForText('blind-twin-typed', {timeoutMs: 2000});
  });
}
