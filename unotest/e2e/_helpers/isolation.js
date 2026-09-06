// Helper for sandbox/isolation-probe: one answer of the probe, written to
// both sinks a reader of the run can open — the journal (`note` →
// steps.jsonl) and the log stream. An empty answer still says something
// (the exit code), so no probe ever leaves a blank line.
function probe_note(name, out) {
  text = out.stdout + out.stderr;
  if (text == '') {
    text = '(empty, exit ' + out.code + ')';
  }
  note('probe:' + name, text);
  log('probe:' + name, text);
}
