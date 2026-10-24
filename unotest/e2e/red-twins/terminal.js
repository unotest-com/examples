// Red twins (#449) of the terminal steps, on the "shell" terminal that
// openTerminal() opens: a pty with no GUI app, so nothing takes the
// keyboard or the screen and it runs on Linux, in CI and in a container
// as well as on a Mac. Each step's failing check stands next to the same
// call passing. A wait for text that never comes, or for text that never
// goes, must fail by its own timeoutMs, well before the default; {not}
// must turn a passing check into a failing one. GUI parity (Terminal.app,
// iTerm2) is in terminal/terminal-app and terminal/iterm2.

function open_echo_window() {
  openTerminal();
  terminalType('clear; echo twin-ready');
  terminalAssertText('clear; echo twin-ready', {timeoutMs: 2000});
  terminalPress('Enter');
  terminalWaitForText('twin-ready');
}

function test_terminal_wait_twins() {
  step("Open a terminal that printed twin-ready", () => { open_echo_window(); });

  step("terminalWaitForText timeoutMs: text that never comes fails in time", () => {
    const started = nowMs();
    assert_failed_with(caught_message(() => terminalWaitForText('never-printed', {timeoutMs: 300})), 'never-printed');
    assert_failed_in_time(started, 'terminalWaitForText');
    terminalWaitForText('twin-ready', {timeoutMs: 300});
  });

  step("terminalWaitForText: a timeout shows the end of the screen, the text printed before", () => {
    const message = caught_message(() => terminalWaitForText('never-printed', {timeoutMs: 300}));
    assert_failed_with(message, 'The screen ends with:');
    assert_failed_with(message, 'twin-ready');
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

  step("terminalText: the screen holds what was printed, and nothing that was not", () => {
    assert_failed_with(
      caught_message(() => assertTrue(textContains(terminalText(), 'never-printed'), 'terminalText holds never-printed')),
      'never-printed',
    );
    assertTrue(textContains(terminalText(), 'twin-ready'), 'terminalText holds twin-ready');
  });
}

function test_terminal_wait_within_budget_twin() {
  setTestTimeout(8000);
  step("a wait longer than the test's budget fails with the screen, not with the budget", () => {
    open_echo_window();
    assert_failed_with(caught_message(() => terminalWaitForText('never-printed', {timeoutMs: 60000})), 'budget'); // lint-ok: the twin asks for more than the budget on purpose
  });
}

function test_terminal_host_twins() {
  step("host: the shell terminal runs here and refuses one, opens without it", () => {
    assert_failed_with(caught_message(() => openTerminal('shell', {host: 'twin@127.0.0.1'})), 'runs on this machine');
    open_echo_window();
  });
}

function test_terminal_type_echo_twins() {
  step("terminalType echo: text a program does not echo fails the wait, {echo: false} types it", () => {
    open_echo_window();
    // A shell echoes what is typed at its prompt itself; `read -s` does not
    // — once it runs: the text waits for its marker.
    terminalType('echo "hidden-""armed"; read -s H; echo "got-$H"');
    terminalPress('Enter');
    terminalWaitForText(/^hidden-armed$/m, {timeoutMs: 2000});
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

function test_terminal_press_twins() {
  step("terminalPress: Meta has no app to take it and is refused; Alt reaches the program", () => {
    openTerminal();
    // `cat -v` prints every byte a key sends.
    terminalType('stty raw -echo; echo keys-ready; cat -v');
    terminalPress('Enter');
    terminalWaitForText(/^keys-ready/m);
    assert_failed_with(caught_message(() => terminalPress('Meta+x')), 'Meta');
    terminalPress('Alt+x');
    terminalWaitForText('^[x', {timeoutMs: 2000});
  });
}

function test_terminal_resize_twins() {
  step("terminalResize: no columns is refused; a size is what the program sees", () => {
    open_echo_window();
    assert_failed_with(caught_message(() => terminalResize(0, 24)), 'cols must be a positive whole number');
    terminalResize(100, 30);
    terminalType('stty size');
    terminalPress('Enter');
    terminalWaitForText(/^30 100$/m, {timeoutMs: 2000});
  });
}

function test_terminal_screenshot_twins() {
  step("terminalScreenshot: with no terminal open there is nothing to frame; with one, its picture is filed", () => {
    assert_failed_with(caught_message(() => terminalScreenshot('twin-shot')), 'no terminal is open');
    open_echo_window();
    const shot = terminalScreenshot('twin-shot');
    assertTrue(textContains(shot, 'twin-shot'), 'screenshot path: ' + shot);
  });
}

function test_terminal_clipboard_twins() {
  step("terminalClipboardRead: empty until a program sets it with OSC 52", () => {
    open_echo_window();
    assert_failed_with(caught_message(() => assertEqual(terminalClipboardRead(), 'clip-17')), 'clip-17');
    terminalType("printf '\\033]52;c;%s\\007' $(printf clip-17 | base64); echo set-done");
    terminalPress('Enter');
    terminalWaitForText(/^set-done$/m, {timeoutMs: 2000});
    assertEqual(terminalClipboardRead(), 'clip-17');
  });

  step("terminalClipboardWrite: what a program asks the terminal for with OSC 52", () => {
    terminalClipboardWrite('from-the-test');
    // The answer arrives as input with no line end: read it byte by byte
    // (-icanon) up to its BEL, keep what follows the last `;`, decode it.
    terminalType("stty -icanon -echo; printf '\\033]52;c;?\\007'; IFS= read -r -d $'\\a' R; stty sane; " +
      "echo \"pasted-$(printf %s \"${R##*;}\" | base64 --decode)\"");
    terminalPress('Enter');
    terminalWaitForText('pasted-from-the-test', {timeoutMs: 2000});
  });
}

function test_terminal_close_twins() {
  step("closeTerminal: a step after it has no terminal; opening again has one", () => {
    open_echo_window();
    closeTerminal();
    assert_failed_with(caught_message(() => terminalText()), 'no open terminal');
    open_echo_window();
    assertTrue(textContains(terminalText(), 'twin-ready'), 'terminalText after opening again');
  });
}

function test_terminal_launch_twins() {
  step("launch keys: each one a bad value fails by name, a good one is seen on the screen", () => {
    assert_failed_with(caught_message(() => openTerminal('shell', {cwd: 'no-such-dir-twin'})), 'no-such-dir-twin');
    assert_failed_with(caught_message(() => openTerminal('shell', {shell: 'no-such-shell-twin'})), 'no-such-shell-twin');
    assert_failed_with(caught_message(() => openTerminal('shell', {cols: 0})), 'cols must be a positive whole number');
    assert_failed_with(caught_message(() => openTerminal('shell', {rows: 0})), 'rows must be a positive whole number');
    assert_failed_with(caught_message(() => openTerminal('shell', {term: ''})), 'term must not be empty');
    assert_failed_with(caught_message(() => openTerminal('shell', {locale: ''})), 'locale must not be empty');
    assert_failed_with(caught_message(() => openTerminal('shell', {env: {TWIN_TOKEN: 5}})), 'env.TWIN_TOKEN must be a string');
    assert_failed_with(caught_message(() => openTerminal('shell', {cleanProfile: true, shell: 'cat'})), 'cleanProfile does not know how to start "cat"');
    assert_failed_with(caught_message(() => openTerminal('Terminal', {cwd: '.'})), 'set up the shell terminal');
    openTerminal('shell', {cleanProfile: true, shell: 'sh', term: 'vt100', locale: 'en_US.UTF-8'});
    terminalType('echo "term=$TERM all=$LC_ALL"');
    terminalPress('Enter');
    terminalWaitForText('term=vt100 all=en_US.UTF-8', {timeoutMs: 5000});
  });
}

function test_terminal_launch_key_typo_twin() {
  step("a misspelt launch key is refused with the keys the call reads", () => {
    const typo = JSON.parse('{"cleanprofile": true}');
    assert_failed_with(caught_message(() => openTerminal('shell', typo)), 'cleanProfile');
  });
}

function test_terminal_exit_twins() {
  step("terminalWaitForExit code: another code fails and names both, the same code passes", () => {
    openTerminal();
    terminalType('echo exiting; exit 3');
    terminalPress('Enter');
    assert_failed_with(caught_message(() => terminalWaitForExit({code: 0, timeoutMs: 5000})), 'expected exit code 0, got 3');
    terminalWaitForExit({code: 3, timeoutMs: 5000});
  });

  step("terminalWaitForExit: after the exit, typing is refused and says to open another terminal", () => {
    assert_failed_with(caught_message(() => terminalType('x', {echo: false})), 'open another terminal');
  });

  step("terminalWaitForExit timeoutMs: a shell that lives fails in time, one that exited does not wait", () => {
    closeTerminal();
    open_echo_window();
    const started = nowMs();
    assert_failed_with(caught_message(() => terminalWaitForExit({timeoutMs: 300})), 'did not exit within 300ms');
    assert_failed_in_time(started, 'terminalWaitForExit');
    terminalType('exit 0');
    terminalPress('Enter');
    terminalWaitForExit({timeoutMs: 5000});
  });
}

function test_terminal_remote_twins() {
  step("the remote terminal: no host, a bad host and the keys of a local shell fail by name", () => {
    assert_failed_with(caught_message(() => openTerminal('ssh')), "needs {host: 'user@address'}");
    assert_failed_with(caught_message(() => openTerminal('ssh', {host: 'not a host'})), 'not a host');
    assert_failed_with(caught_message(() => openTerminal('ssh', {host: 'admin@127.0.0.1', env: {A: '1'}})), 'env set up a local shell');
    assert_failed_with(caught_message(() => openTerminal('ssh', {host: 'admin@127.0.0.1', cwd: '.'})), 'cwd set up a local shell');
    assert_failed_with(caught_message(() => openTerminal('ssh', {host: 'admin@127.0.0.1', cols: 0})), 'cols must be a positive whole number');
  });
}
