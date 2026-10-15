// A real Terminal.app window: real key events, the screen read as text,
// the window framed. macOS only, and a local run takes the keyboard —
// not in the dogfood collection, which also runs on Linux boxes.
//
// `stty raw -echo; cat -v` prints every byte a key sends, so the screen
// shows what the program in the terminal really received.
//
// UNOTEST_DOGFOOD_TERMINAL_HOST=admin@<vm ip> runs it in a Tart VM instead
// of on this Mac.

function openHere(app) {
  let host = env('UNOTEST_DOGFOOD_TERMINAL_HOST');
  if (host == null) {
    return openTerminal(app);
  }
  return openTerminal(app, { host: host });
}

function openKeyEcho() {
  openHere('Terminal');
  terminalResize(100, 30);
  terminalType('clear; stty raw -echo; echo keys-ready; cat -v');
  terminalPress('Enter');
  terminalWaitForText('keys-ready');
}

function test_terminal_keys_reach_the_program() {
  step("Shift+Enter is a real key event: Terminal.app sends it as CR", () => {
    openKeyEcho();
    terminalPress('Shift+Enter');
    terminalWaitForText('^M');
  });

  step("Control+] and an arrow arrive as their bytes", () => {
    terminalPress('Control+]');
    terminalPress('ArrowUp');
    terminalWaitForText(/\^\]\^\[\[A/);
    terminalAssertText('^[[B', { not: true });
  });

  step("The window's last frame is evidence", () => {
    let shot = terminalScreenshot('key-echo');
    assertTrue(textContains(shot, 'key-echo'), 'screenshot path: ' + shot);
  });
}

function test_terminal_path_in_the_current_window() {
  step("A new window's shell has the system PATH", () => {
    openHere('Terminal');
    terminalType('echo "PATH=$PATH"');
    terminalPress('Enter');
    terminalWaitForText(/PATH=.*\/usr\/bin/);
  });

  step("Two windows: the steps follow setTerminal, each closes on its own", () => {
    let first = 0;
    let second = openHere('Terminal');
    terminalType('echo second-window');
    terminalPress('Enter');
    terminalWaitForText('second-window');
    setTerminal(first);
    terminalAssertText('second-window', { not: true });
    setTerminal(second);
    closeTerminal();
    setTerminal(first);
    terminalAssertText(/PATH=/);
  });
}

function test_terminal_type_without_echo() {
  step("Text goes in whatever the layout and shows before Enter", () => {
    openHere('Terminal');
    terminalType('clear; echo layout-ok');
    terminalPress('Enter');
    terminalWaitForText(/^layout-ok$/m);
  });

  step("Input a program does not echo goes with {echo: false}", () => {
    // bash echoes what is typed at its prompt itself; `read -s` does not.
    terminalType('read -s SECRET; echo "got-$SECRET"');
    terminalPress('Enter');
    terminalType('typed-blind', { echo: false });
    terminalPress('Enter');
    terminalWaitForText('got-typed-blind');
  });
}
