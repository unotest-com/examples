// What does a run on a box see of the Picker? This scenario asserts
// nothing: it asks the process around it and writes every answer to the
// journal (`note` → steps.jsonl) and to the log stream, the way
// sandbox/isolation-probe does. Whoever reads the run compares the
// answers with section 19 of docs/testing/grounder-providers.md.
//
// There is no way to read the environment from the DSL — the vocabulary
// has no `env` function — so `shell` is the only honest question a
// scenario can ask about it.
//
// The token is NEVER printed. Its LENGTH answers the only question a
// reader has (did it arrive, or is picker.env empty), and a value in a
// run's journal is a value in everybody's journal.
//
// GREEN on purpose, like sandbox/isolation-probe: a probe that fails
// hides the answer it was sent for. Every command may fail — a missing
// variable IS an expected answer on a box without a Picker.

function test_picker_probe_reports_what_a_run_sees() {
  step("Grounder names in the run's own environment", () => {
    probe_note('grounder-names', shell('sh', '-c', 'env | grep -E "^UNOTEST_GROUNDER_" | cut -d= -f1 | sort | tr "\\n" " "', {allowNonZero: true}));
    probe_note('grounder-mode', shell('sh', '-c', 'echo "UNOTEST_GROUNDER_MODE=${UNOTEST_GROUNDER_MODE:-<unset>}"', {allowNonZero: true}));
    probe_note('grounder-token-bytes', shell('sh', '-c', 'printf "%s" "${UNOTEST_GROUNDER_REMOTE_TOKEN:-}" | wc -c', {allowNonZero: true}));
    probe_note('grounder-url-origin', shell('sh', '-c', 'echo "${UNOTEST_GROUNDER_REMOTE_URL:-<unset>}" | sed -E "s#^([a-zA-Z]+://[^/]+).*#\\1#"', {allowNonZero: true}));
    probe_note('secret-names', shell('sh', '-c', 'echo "${UNOTEST_BOX_SECRET_NAMES:-<unset>}"', {allowNonZero: true}));
  });

  step("Can the run reach the grounder it was given", () => {
    // curl prints the HTTP code, or 000 when it cannot connect or resolve.
    probe_note('grounder-health', shell('sh', '-c', 'url="${UNOTEST_GROUNDER_REMOTE_URL:-}"; if [ -z "$url" ]; then echo "no-url"; else curl -s -o /dev/null -m 8 -w "%{http_code}" "$url/health"; fi', {allowNonZero: true}));
  });
}
