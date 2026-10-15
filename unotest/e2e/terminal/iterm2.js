// iTerm2 parity: the same steps against iTerm2. With the kitty keyboard
// protocol switched on (CSI > 1 u), iTerm2 tells Shift+Enter from Enter —
// what a TUI such as Claude Code relies on, and Terminal.app cannot.
// macOS with iTerm2 installed and allowed to be controlled; not in the
// dogfood collection.

function test_iterm2_shift_enter_under_kitty_protocol() {
  step("Shift+Enter arrives as CSI 13;2 u, Enter as CR", () => {
    openTerminal('iTerm2');
    terminalType("clear; printf '\\033[>1u'; stty raw -echo; echo keys-ready; cat -v");
    terminalPress('Enter');
    terminalWaitForText('keys-ready');
    terminalPress('Shift+Enter');
    terminalWaitForText('^[[13;2u');
    terminalPress('Enter');
    terminalWaitForText(/\^\[\[13;2u.*\^M/);
  });
}
