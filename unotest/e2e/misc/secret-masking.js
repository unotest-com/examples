// A secret is pushed on purpose into every sink a reader of a run can open:
// the log stream (which a runner copies into its own stdout log and streams
// to a viewer) and a `note` event (which lands as a line of steps.jsonl).
//
// The scenario is GREEN on purpose. What it asserts is not in the DSL but in
// the artifacts, and the assertion is made by whoever greps the run: the
// masking marker must be there, the value must not, and the line must still
// be readable. Masking has to REPLACE — a swallowed line trades a leak for
// lost diagnostics, and nobody notices the second one.
//
// MASKING_PROBE exists for this and nothing else. Point it at a long,
// non-dictionary value: a masker matches a secret as a substring anywhere in
// the text, so a short or word-like value gets cut out of the middle of
// ordinary words and quietly corrupts step labels, URLs and captured HTML.
// Never reuse an application's own credentials for this — they are exactly
// the values likely to collide with the text around them.

function test_secret_reaches_no_sink_unmasked() {
  step("Open the playground hub", () => {
    goto('/');
    waitForText('Stress-test browser');
  });

  step("Push the secret into the log stream and into the journal", () => {
    log(MASKING_PROBE);
    note('secret-probe', MASKING_PROBE);
  });
}
