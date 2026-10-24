// The "ssh" terminal: the same terminal steps over `ssh -tt` to a host with
// no GUI — a Linux VM, a server. Runs where UNOTEST_DOGFOOD_SSH_HOST
// ("user@address", reachable with the ssh agent's key or ~/.ssh) is set.

function test_ssh_terminal_runs_a_command_on_the_host() {
  skip('UNOTEST_DOGFOOD_SSH_HOST is not set: no host to open a session on', env('UNOTEST_DOGFOOD_SSH_HOST') == null);
  step("A command's output reaches the screen, from the host's own shell", () => {
    openTerminal('ssh', {host: env('UNOTEST_DOGFOOD_SSH_HOST'), cols: 100, rows: 30});
    terminalType('echo ssh-dogfood-$((40+2)) $(tput cols)');
    terminalPress('Enter');
    terminalWaitForText(/ssh-dogfood-42 100/);
  });
}
