// Where the suite may WRITE while it runs: the seeded sqlite file, the
// files the sandbox scenarios create and watch.
//
// On a box the bundle's sources are mounted read-only into the run's
// container (docs/plans/run-isolation.md): the only writable places are the
// run's artifacts and `/tmp`. Anything the suite generates therefore goes
// to `/tmp` there — the run is the only tenant of its container, and the
// container is gone after the run. On a developer's machine the same files
// stay under `unotest/.tmp/` (gitignored, never packed), where they can be
// looked at after a run.
//
// The box is recognised by `UNOTEST_ARTIFACTS_ROOT`, which the runner
// container gets and a local run does not. The DSL side of the same rule is
// `scratch_path()` in e2e/_helpers/scratch.js — keep the two in step.
import { join } from "node:path";

export const BOX_SCRATCH_DIR = "/tmp/unotest-dogfood";

/** The suite's scratch directory for THIS process: `<root>/unotest/.tmp`
 *  locally, `/tmp/unotest-dogfood` inside a box run. */
export function scratchDir(root, env = process.env) {
  return env.UNOTEST_ARTIFACTS_ROOT ? BOX_SCRATCH_DIR : join(root, "unotest", ".tmp");
}
