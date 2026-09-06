// Where does a run's code actually stand? This scenario asserts nothing: it
// asks the process around it — uid, mounts, environment, network — and
// writes each answer (helper `probe_note` in _helpers/isolation.js) to the
// journal as a `note` (steps.jsonl) and to the log stream. Whoever reads the
// run compares the answers with the isolation model in
// docs/testing/run-isolation.md: before the runner sidecar a run is
// a child of boxd and sees everything boxd sees; after it, only its own
// bundle sources (read-only), its own artefacts and the outside world.
//
// GREEN on purpose, like misc/secret-masking: a probe that fails hides the
// very answer it was sent for. Every command is allowed to fail — a missing
// directory IS the expected answer after isolation.
//
// It runs alone, in the `isolation` collection, never in the hourly dogfood
// tick: before isolation the touch probes leave (and remove) files in the
// bundle's own sources.

function test_isolation_probe_reports_what_a_run_can_reach() {
  step("Identity, working directory and home", () => {
    probe_note('id', shell('id', {allowNonZero: true}));
    probe_note('cwd-home', shell('sh', '-c', 'pwd; echo HOME=$HOME', {allowNonZero: true}));
  });

  step("Daemon state and other environments", () => {
    probe_note('state-dir', shell('ls', '/var/lib/unotest/boxd', {allowNonZero: true}));
    probe_note('notifications', shell('sh', '-c', 'test -r /var/lib/unotest/boxd/notifications.json && echo readable || echo absent', {allowNonZero: true}));
    probe_note('projects', shell('ls', '/projects', {allowNonZero: true}));
    probe_note('env-dir', shell('ls', '/projects/dogfood/envs/prod', {allowNonZero: true}));
    probe_note('other-env', shell('ls', '/projects/demo/envs/dev', {allowNonZero: true}));
  });

  step("Writable and read-only paths", () => {
    // The bundle's own sources: writable before isolation, read-only after.
    probe_note('touch-sources', shell('sh', '-c', 'touch ./.isolation-probe && echo created && rm -f ./.isolation-probe', {allowNonZero: true}));
    probe_note('rootfs', shell('sh', '-c', 'touch /.isolation-probe && echo created && rm -f /.isolation-probe', {allowNonZero: true}));
    probe_note('tmp', shell('sh', '-c', 'touch /tmp/.isolation-probe && echo created && rm -f /tmp/.isolation-probe', {allowNonZero: true}));
    probe_note('docker-sock', shell('ls', '-la', '/var/run/docker.sock', {allowNonZero: true}));
    probe_note('caps', shell('grep', 'CapEff', '/proc/self/status', {allowNonZero: true}));
  });

  step("Environment variables", () => {
    probe_note('env-daemon', shell('sh', '-c', 'env | grep -E "^(BOXD_|LAB_|npm_config|NPM_CONFIG)" | cut -d= -f1 | sort | tr "\\n" " "', {allowNonZero: true}));
    probe_note('env-run', shell('sh', '-c', 'env | grep -E "^UNOTEST_" | cut -d= -f1 | sort | tr "\\n" " "', {allowNonZero: true}));
    probe_note('env-run-trigger', shell('sh', '-c', 'echo "UNOTEST_RUN_TRIGGER=${UNOTEST_RUN_TRIGGER:-<unset>}"', {allowNonZero: true}));
    probe_note('env-own', shell('sh', '-c', 'env | grep -c -E "^(APP_BASE_URL|LOGIN|PASSWORD)="', {allowNonZero: true}));
    probe_note('env-secretish', shell('sh', '-c', 'env | cut -d= -f1 | grep -i -E "token|secret" | sort | tr "\\n" " "', {allowNonZero: true}));
  });

  step("Network: the box itself, the sidecar, the outside", () => {
    // curl prints the HTTP code, or 000 when it cannot connect or resolve.
    probe_note('net-boxd', shell('curl', '-s', '-o', '/dev/null', '-m', '4', '-w', '%{http_code}', 'http://boxd:8081/health', {allowNonZero: true}));
    probe_note('net-guard', shell('curl', '-s', '-o', '/dev/null', '-m', '4', '-w', '%{http_code}', 'http://guard:8080/', {allowNonZero: true}));
    probe_note('net-runner', shell('curl', '-s', '-o', '/dev/null', '-m', '4', '-w', '%{http_code}', 'http://runner:8082/runs', {allowNonZero: true}));
    probe_note('net-out', shell('curl', '-s', '-o', '/dev/null', '-m', '8', '-w', '%{http_code}', APP_BASE_URL, {allowNonZero: true}));
    probe_note('net-host', shell('curl', '-s', '-o', '/dev/null', '-m', '4', '-w', '%{http_code}', 'http://host.docker.internal:8099/health', {allowNonZero: true}));
  });
}
