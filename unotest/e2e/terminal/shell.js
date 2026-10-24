// The "shell" terminal: a pty with no GUI app, read through a screen
// emulator. Headless — it takes neither the keyboard nor the screen, and
// runs on Linux and in CI as on a Mac.
//
// `stty raw -echo; cat -v` prints every byte a key sends, so the screen
// shows what the program in the terminal really received.

function openKeyEcho() {
  openTerminal();
  terminalType('clear; stty raw -echo; echo keys-ready; cat -v');
  terminalPress('Enter');
  terminalWaitForText(/^keys-ready/m);
}

function test_shell_keys_reach_the_program() {
  step("Control+] and an arrow arrive as their bytes", () => {
    openKeyEcho();
    terminalPress('Control+]');
    terminalPress('ArrowUp');
    terminalWaitForText(/\^\]\^\[\[A/);
  });

  step("A program in application cursor mode gets the arrows it asked for", () => {
    closeTerminal();
    openTerminal();
    terminalType("clear; printf '\\033[?1h'; stty raw -echo; echo app-ready; cat -v");
    terminalPress('Enter');
    terminalWaitForText(/^app-ready/m);
    terminalPress('ArrowUp');
    terminalWaitForText('^[OA');
  });

  step("The terminal's frame is evidence", () => {
    let shot = terminalScreenshot('shell-keys');
    assertTrue(textContains(shot, 'shell-keys'), 'screenshot path: ' + shot);
  });
}

function test_shell_two_terminals() {
  step("Two terminals: the steps follow setTerminal, each closes on its own", () => {
    let first = openTerminal();
    terminalType('echo first-terminal');
    terminalPress('Enter');
    terminalWaitForText(/^first-terminal$/m);
    let second = openTerminal('shell', { leaveOpen: true });
    terminalType('echo second-terminal');
    terminalPress('Enter');
    terminalWaitForText(/^second-terminal$/m);
    setTerminal(first);
    terminalAssertText('second-terminal', { not: true });
    setTerminal(second);
    closeTerminal();
    setTerminal(first);
    terminalAssertText(/^first-terminal$/m);
  });
}

function test_shell_launch_is_the_same_on_every_machine() {
  step("cleanProfile with cwd, env, size and locale: the screen shows exactly those", () => {
    openTerminal('shell', {
      cleanProfile: true,
      shell: 'sh',
      cwd: 'unotest',
      env: {GREETING: 'hi'},
      cols: 100,
      rows: 30,
      locale: 'en_US.UTF-8',
    });
    terminalType('echo "greeting=$GREETING lang=$LANG size=$(tput cols)x$(tput lines) dir=$(basename "$PWD")"');
    terminalPress('Enter');
    terminalWaitForText(/greeting=hi lang=en_US\.UTF-8 size=100x30 dir=unotest$/m);
    terminalAssertText(/^\$ /m);
  });
}

function test_shell_exit_code() {
  step("A command's exit code is the shell's, and a clean exit passes {code: 0}", () => {
    openTerminal();
    terminalType('exit 3');
    terminalPress('Enter');
    assertEqual(terminalWaitForExit().exitCode, 3);
    closeTerminal();
    openTerminal();
    terminalType('echo done; exit 0');
    terminalPress('Enter');
    assertEqual(terminalWaitForExit({code: 0}).signal, null);
  });
}
