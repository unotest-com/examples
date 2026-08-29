#!/usr/bin/env node
// The app under test for `unotest/e2e/viewer/*` — a viewer, held open on a
// frozen fixture project.
//
// The viewer is a localhost tool: it reads a project's `.runs` and launches
// tests from its UI, so it is never deployed anywhere. That leaves one
// question for a test — WHICH project it opens. Pointed at this repo it
// would show whatever we happened to run today and the scenarios would
// flake on our own history. So it opens `unotest/fixtures/viewer-project`
// (one green run, one failed, one collection — committed artifacts).
//
// Two modes:
//
//   --ensure   idempotent, fast, safe to call from a scenario: brings the
//              fixture viewer up if it is down and returns. This is what
//              `flow_open_fixture_viewer()` calls, which is what makes the
//              suite runnable EVERYWHERE — plain `unotest-web e2e`, the Run
//              button in a viewer's UI, an agent's `run_test` — with no
//              environment to pick and no wrapper script to remember.
//   (default)  boot and hold; used by `--ensure` for the detached child,
//              and by a human who wants the fixture viewer up to poke at.
//
// The URL is fixed (VIEWER_URL in unotest/.env) because a URL that moves
// cannot be written down — and because a fixed port is the one thing that
// lets `--ensure` recognise an instance it already started.

import { spawn } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// This file travels WITH the suite (it is a fixture stand, like
// unotest/fixtures/api/server.mjs), so everything below is resolved from
// the project root it sits in — the monorepo and a checked-out examples
// mirror behave identically.
const root = resolve(fileURLToPath(import.meta.url), "..", "..", "..", "..");
// The CLI the project itself uses, resolved the way any consumer resolves
// it: node's algorithm from the project root. In the monorepo that is the
// workspace link to packages/web; in the mirror it is whatever `npm ci`
// pinned. A hardcoded monorepo path here once made the suite die with
// MODULE_NOT_FOUND everywhere but this repo.
const webPkgPath = createRequire(join(root, "noop.js")).resolve(
  "@unotest/web/package.json",
);
const cli = resolve(
  webPkgPath,
  "..",
  JSON.parse(readFileSync(webPkgPath, "utf8")).bin["unotest-web"],
);
const fixture = join(root, "unotest/fixtures/viewer-project");
// Deterministic path, not a mkdtemp: the URL is fixed, so the project
// behind it has to be fixed too — that is what makes the identity check
// below possible at all. Inside the project (gitignored) because the viewer
// resolves @unotest/viewer by walking up to the project's node_modules; a
// copy in the system temp dir cannot start.
const tmp = join(root, "unotest/.tmp");
const workDir = join(tmp, "viewer-fixture");
// Exclusive-create mutex: two scenarios ensuring at the same moment must
// not both wipe and re-copy the fixture under a viewer that is already
// serving it. Holds the owner's pid — a holder killed with SIGKILL never
// runs its cleanup, and a lock nobody can prove is dead is a lock that has
// to be removed by hand.
const bootLock = join(tmp, "viewer-fixture.boot");
/** A lock whose pid is unreadable is presumed dead after this long. */
const LOCK_STALE_MS = 60_000;
// Every `--ensure` touches this; the holder exits once it goes stale. A
// suite run touches it every few seconds, so the holder survives the run
// and is gone shortly after — which is what keeps each run's fixture copy
// clean (the Run-button scenario writes a run into it).
const touchFile = join(tmp, "viewer-fixture.touch");
// Holder pid, so `--ensure` can retire an instance whose fixture copy has
// been written into (see `runCount`).
const pidFile = join(tmp, "viewer-fixture.pid");
// Long on purpose. Freshness of the fixture copy is NOT what this timer
// buys — `--ensure` retires a spent copy by run count, whatever the
// holder's age. Idle exit only stops the process from leaking, so it must
// be comfortably longer than the longest scenario: `viewer/run-from-ui`
// presses Run and waits for a whole test to finish, and it touches the file
// once, at its first step. A minute here killed the viewer mid-scenario.
const IDLE_EXIT_MS = 10 * 60_000;
const IDLE_CHECK_MS = 15_000;

const url = (process.env.VIEWER_URL ?? "http://localhost:57351").replace(/\/$/, "");
const ensureMode = process.argv.includes("--ensure");
const stopMode = process.argv.includes("--stop");

/** Who is answering on `url`: the fixture viewer, someone else, or nobody.
 *
 *  A fixed port is convenient and it is also the one way this setup can
 *  lie: a human's own viewer parked on the same port would answer every
 *  probe, and the suite would quietly test THEIR project — reporting
 *  failures about scenarios that were never supposed to be there. The
 *  viewer names its project in `/api/targets`, so ask. */
async function identify() {
  let res;
  try {
    res = await fetch(`${url}/api/targets`, {
      signal: AbortSignal.timeout(2_000),
    });
  } catch {
    return { kind: "free" };
  }
  if (!res.ok) return { kind: "stranger", what: `HTTP ${res.status}` };
  let body;
  try {
    body = await res.json();
  } catch {
    return { kind: "stranger", what: "a non-JSON response" };
  }
  const projectRoot = body?.projectRoot;
  if (typeof projectRoot !== "string") {
    return { kind: "stranger", what: "a server that is not a viewer" };
  }
  return resolve(projectRoot) === workDir
    ? { kind: "ours" }
    : { kind: "stranger", what: `a viewer on ${projectRoot}` };
}

function touch() {
  mkdirSync(tmp, { recursive: true });
  try {
    const now = new Date();
    utimesSync(touchFile, now, now);
  } catch {
    writeFileSync(touchFile, "");
  }
}

/** Run directories under a project's `unotest/.runs` (`<year>/<mm>/<dd>/<id>`).
 *
 *  The fixture's whole value is that its numbers are FROZEN, and one
 *  scenario presses Run in the UI — which writes a run into the copy. Left
 *  there, the next scenario asking "how many rows does history show" gets
 *  yesterday's answer plus one. So a copy with more runs than the fixture is
 *  spent, and `--ensure` retires the holder serving it. */
function runCount(projectRoot) {
  const runsRoot = join(projectRoot, "unotest/.runs");
  let count = 0;
  const walk = (dir, depth) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (!e.isDirectory() || e.name.startsWith("_")) continue;
      if (depth === 3) count++;
      else walk(join(dir, e.name), depth + 1);
    }
  };
  walk(runsRoot, 0);
  return count;
}

/** True while `pid` is a live process we may signal. */
function alive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    // EPERM = alive but not ours to signal; only ESRCH means gone.
    return e.code === "EPERM";
  }
}

/** Take the boot lock, or report that a live holder already has it.
 *
 *  The lock carries the owner's pid because the owner does not always get
 *  to clean up: SIGKILL, a laptop asleep, a crashed Nest boot. A lock whose
 *  owner is gone would otherwise wedge every later run — the failure would
 *  read as "the fixture viewer never came up" and the fix would be a manual
 *  `rm` nobody has any reason to guess. */
function claimBootLock() {
  try {
    writeFileSync(bootLock, String(process.pid), { flag: "wx" });
    return true;
  } catch (e) {
    if (e.code !== "EEXIST") throw e;
  }
  let owner = NaN;
  try {
    owner = Number(readFileSync(bootLock, "utf8").trim());
  } catch {
    // Unreadable — fall through to the age check.
  }
  if (alive(owner)) return false;
  // No readable pid: only age can answer. A lock younger than the boot
  // itself may belong to a holder that has not written its pid yet.
  if (!Number.isInteger(owner) || owner <= 0) {
    let age = Infinity;
    try {
      age = Date.now() - statSync(bootLock).mtimeMs;
    } catch {
      // Vanished between the two calls — it is ours to take.
    }
    if (age < LOCK_STALE_MS) return false;
  }
  rmSync(bootLock, { recursive: true, force: true });
  try {
    writeFileSync(bootLock, String(process.pid), { flag: "wx" });
    return true;
  } catch {
    // Someone won the race in between; they own the boot.
    return false;
  }
}

function readPid(file, parse = (s) => Number(s.trim())) {
  try {
    return parse(readFileSync(file, "utf8"));
  } catch {
    return NaN;
  }
}

/** Retire the fixture viewer we are looking at, holder and all.
 *
 *  Two pids, because the holder is not always the one still standing: it
 *  can be SIGKILLed (or die with the terminal that started it) while the
 *  viewer it spawned keeps the port — an orphan nothing would ever retire,
 *  which would leave a spent fixture copy served forever. The viewer writes
 *  its own pid into the copy's lockfile, and we only get here after
 *  `identify()` said the port is serving THAT copy. */
function stopHolder() {
  const holder = readPid(pidFile);
  const viewerPid = readPid(join(workDir, "unotest/.viewer.lock"), (s) =>
    Number(JSON.parse(s).pid),
  );
  for (const pid of [holder, viewerPid]) {
    if (!alive(pid)) continue;
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      // Gone between the check and the signal — the port check is the real
      // answer either way.
    }
  }
  rmSync(pidFile, { force: true });
}

function strangerMessage(what) {
  return (
    `viewer-fixture-server: ${url} is already answering — ${what}.\n` +
    `The viewer e2e suite needs that port for its own fixture viewer.\n` +
    `Stop whatever holds it, or move VIEWER_URL in unotest/.env.`
  );
}

const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));

// ── --stop ───────────────────────────────────────────────────────────────
// The fixture viewer outlives the suite on purpose (the next run reuses it
// in milliseconds), which is exactly wrong for a caller that has to leave
// the machine as it found it — the release gate refuses to publish while
// ANY viewer is up, including the one its own dogfood step started.
//
// Only ever retires OUR fixture viewer: a stranger on the port is somebody
// else's work and is reported, never killed.
if (stopMode) {
  const who = await identify();
  if (who.kind === "stranger") {
    console.error(strangerMessage(who.what));
    process.exit(1);
  }
  if (who.kind === "free") {
    console.log("viewer-fixture-server: nothing to stop");
    process.exit(0);
  }
  stopHolder();
  const goneBy = Date.now() + 15_000;
  while (Date.now() < goneBy) {
    await sleep(200);
    if ((await identify()).kind === "free") {
      console.log(`viewer-fixture-server: stopped the fixture viewer on ${url}`);
      process.exit(0);
    }
  }
  console.error(`viewer-fixture-server: ${url} is still answering after SIGTERM`);
  process.exit(1);
}

// ── --ensure ─────────────────────────────────────────────────────────────
if (ensureMode) {
  const who = await identify();
  if (who.kind === "stranger") {
    console.error(strangerMessage(who.what));
    process.exit(1);
  }
  if (who.kind === "ours") {
    // Reusable only while it is BOTH frozen and supervised: a copy with
    // extra runs answers yesterday's questions (the Run-button scenario
    // writes into it), and a viewer whose holder died is an orphan that
    // will never idle-exit or be retired later.
    const spent =
      runCount(workDir) !== runCount(fixture) || !alive(readPid(pidFile));
    if (!spent) {
      touch();
      process.exit(0);
    }
    // Retire it and fall through to booting a fresh one, so every scenario
    // starts from the same frozen fixture no matter what ran before it.
    stopHolder();
    const freeBy = Date.now() + 15_000;
    while (Date.now() < freeBy) {
      await sleep(200);
      if ((await identify()).kind === "free") break;
    }
  }
  touch(); // before the child starts, so it never sees a stale timestamp
  const child = spawn(process.execPath, [fileURLToPath(import.meta.url)], {
    cwd: root,
    env: process.env,
    detached: true,
    stdio: "ignore",
  });
  child.unref();
  const deadline = Date.now() + 40_000;
  while (Date.now() < deadline) {
    await sleep(300);
    const now = await identify();
    if (now.kind === "ours") {
      touch();
      process.exit(0);
    }
    if (now.kind === "stranger") {
      console.error(strangerMessage(now.what));
      process.exit(1);
    }
  }
  console.error(
    `viewer-fixture-server: fixture viewer did not come up at ${url} in 40s.\n` +
      `Run \`node unotest/fixtures/viewer/server.mjs\` by hand to see why.`,
  );
  process.exit(1);
}

// ── hold ─────────────────────────────────────────────────────────────────
const who = await identify();
if (who.kind === "stranger") {
  console.error(strangerMessage(who.what));
  process.exit(1);
}
if (who.kind === "ours") {
  console.log(`viewer-fixture-server: fixture viewer already up at ${url}`);
  process.exit(0);
}

mkdirSync(tmp, { recursive: true });
if (!claimBootLock()) {
  console.log("viewer-fixture-server: another holder is already booting");
  process.exit(0);
}

// Fresh copy per boot: one scenario presses Run in the UI, which writes a
// run — against the committed fixture that would dirty the working tree,
// and left in place it would drift the counts the scenarios assert.
rmSync(workDir, { recursive: true, force: true });
cpSync(fixture, workDir, { recursive: true });
touch();

// The child must NOT inherit the run's own scoping: spawned from a running
// scenario it would come up carrying that run's environment/run-id and read
// artifact roots the fixture project has never heard of. Everything that
// identifies THIS run is dropped or set explicitly.
const env = { ...process.env };
for (const key of [
  "UNOTEST_ENV",
  "UNOTEST_RUN_ID",
  "UNOTEST_WORKER_INDEX",
  "UNOTEST_WORKER_COUNT",
  "UNOTEST_CONFIG",
  "APP_BASE_URL",
  "APP_API_BASE_URL",
]) {
  delete env[key];
}
env.UNOTEST_PROJECT_ROOT = workDir;
env.UNOTEST_VIEWER_PORT = new URL(url).port;
env.UNOTEST_VIEWER_NO_OPEN = "1";

const viewer = spawn(process.execPath, [cli, "viewer"], {
  cwd: workDir,
  env,
  stdio: ["ignore", "pipe", "inherit"],
});

writeFileSync(pidFile, String(process.pid));

let stopping = false;
function shutdown(code) {
  if (stopping) return;
  stopping = true;
  viewer.kill("SIGTERM");
  rmSync(pidFile, { force: true });
  rmSync(bootLock, { recursive: true, force: true });
  rmSync(workDir, { recursive: true, force: true });
  process.exit(code);
}
process.on("SIGTERM", () => shutdown(0));
process.on("SIGINT", () => shutdown(0));

const reported = await new Promise((ok, fail) => {
  const timer = setTimeout(
    () => fail(new Error("viewer did not report a URL in 30s")),
    30_000,
  );
  let buffered = "";
  let resolved = false;
  // Keep draining stdout for the whole run: the viewer is a chatty Nest
  // app, and a pipe nobody reads fills up and blocks the child.
  viewer.stdout.on("data", (chunk) => {
    if (resolved) return;
    buffered += String(chunk);
    const match = /viewer up at (http:\/\/\S+)/.exec(buffered);
    if (match) {
      resolved = true;
      buffered = "";
      clearTimeout(timer);
      ok(match[1]);
    }
  });
  viewer.once("exit", (code) => {
    clearTimeout(timer);
    fail(new Error(`viewer exited with code ${code} before reporting a URL`));
  });
}).catch((e) => {
  console.error(`viewer-fixture-server: ${e.message}`);
  shutdown(1);
});

// The port is requested, not guaranteed — if it were taken the viewer would
// have picked another one, and the tests would then probe a URL nothing is
// on. Fail here rather than time out there.
if (new URL(reported).port !== new URL(url).port) {
  console.error(
    `viewer-fixture-server: asked for ${url}, viewer came up at ${reported}.`,
  );
  shutdown(1);
}

console.log(`viewer-fixture-server: fixture viewer up at ${reported}`);
// Nothing to hold once the viewer is gone — and a holder without a viewer
// would keep the pid file pointing at a process that answers nothing.
viewer.once("exit", () => shutdown(0));

// Idle exit. Nobody owns this process — it is started detached by whichever
// scenario needed it first — so it has to end on its own. Every scenario's
// `--ensure` touches the file once, so the window has to outlast the LONGEST
// single scenario (the Run-button one executes a whole test inside itself),
// not the gap between suites. Freshness does not ride on this exit: a spent
// copy is retired by the next `--ensure` via `runCount` either way.
setInterval(() => {
  let age;
  try {
    age = Date.now() - statSync(touchFile).mtimeMs;
  } catch {
    age = Infinity;
  }
  if (age > IDLE_EXIT_MS) shutdown(0);
}, IDLE_CHECK_MS);

await new Promise(() => {});
