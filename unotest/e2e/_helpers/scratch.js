// Where a scenario may write a file of its own. The DSL side of
// unotest/fixtures/scratch.mjs — keep the two in step.
//
// Locally that is `unotest/.tmp/` (relative to shellCwd, gitignored, never
// packed). Inside a box run the bundle's sources are read-only, and the run
// recognises the box by UNOTEST_ARTIFACTS_ROOT; there the files go to
// `/tmp/unotest-dogfood`, the run's own tmpfs. The directory is created on
// the way, so a writer only has to write.
function scratch_path(name) {
  out = shell('sh', '-c', 'if [ -n "$UNOTEST_ARTIFACTS_ROOT" ]; then d=/tmp/unotest-dogfood; else d=unotest/.tmp; fi; mkdir -p "$d" && printf %s "$d/$1"', 'scratch', name);
  assertTrue(out.code == 0, out.stderr);
  return out.stdout;
}
