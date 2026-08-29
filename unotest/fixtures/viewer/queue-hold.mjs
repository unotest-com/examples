#!/usr/bin/env node
// Takes (and gives back) the fixture viewer's run slot, so the queue
// scenarios can test a BUSY machine without racing one.
//
// Why not just start two runs and hope: the first would have to still be
// alive when the second is ordered, which depends on how fast a browser
// launches on the machine running the suite. A test that only fails on
// slow hardware is worse than no test. Here the machine is occupied by
// construction — exactly as it is when a terminal or an agent is holding
// it, which is the case the queue exists for.
//
// The slot is a file, created with `open("wx")` by whoever owns the
// machine (see `packages/core/src/run-queue/`). Holding one from the
// outside is not a hack around the design; it IS the design — every
// producer is a stranger to every other one.
//
// The mtime is backdated on purpose: a lease nobody touches goes stale
// after a minute and is reaped, so this hold expires by itself shortly
// after the scenario that took it. A scenario killed mid-way must not
// leave the fixture viewer wedged for the next one.

import {
  existsSync,
  mkdirSync,
  statSync,
  utimesSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// This file travels WITH the suite (like the other fixture stands), so
// everything is resolved from the project root it sits in.
const root = resolve(fileURLToPath(import.meta.url), "..", "..", "..", "..");
// The frozen project the fixture viewer opens — see server.mjs.
const slotsDir = join(
  root,
  "unotest/.tmp/viewer-fixture/unotest/.queue/slots",
);
const slot = join(slotsDir, "slot-0");

/** The engine treats a lease nobody has touched for this long as dead
 *  (`packages/core/src/run-queue/fs-run-queue.ts`). */
const STALE_MS = 60_000;
/** How much of that life is already spent when we take the lease, so a
 *  scenario killed mid-way frees the fixture viewer well inside a
 *  minute. Leaves ~30s of hold — the queued/cancel assertions in
 *  `run-queue.js` must finish inside that window, and on a slow machine
 *  15s (the previous 45s backdate) proved too tight: the queued run
 *  would start by itself mid-assertion. */
const BACKDATE_MS = 30_000;
/** How long to wait for a real run to give the slot back before failing. */
const WAIT_FOR_FREE_MS = 25_000;

const mode = process.argv.includes("--release") ? "release" : "take";

if (mode === "release") {
  rmSync(slot, { force: true });
  console.log("queue-hold: slot released");
  process.exit(0);
}

mkdirSync(slotsDir, { recursive: true });
const deadline = Date.now() + WAIT_FOR_FREE_MS;
while (existsSync(slot)) {
  // A lease past the staleness window belongs to a process that is gone
  // — normally the previous run of THIS scenario, killed before it could
  // give the slot back. The engine reaps such leases when the next
  // producer comes along; here we are that producer.
  if (Date.now() - statSync(slot).mtimeMs > STALE_MS) {
    rmSync(slot, { force: true });
    break;
  }
  if (Date.now() > deadline) {
    console.error(
      `queue-hold: the slot at ${slot} is still held after ` +
        `${WAIT_FOR_FREE_MS / 1000}s — a previous run never finished. ` +
        `Remove the file (or wait a minute for it to go stale) and retry.`,
    );
    process.exit(1);
  }
  // A run that is finishing releases its lease when its process exits;
  // busy-waiting a beat is the whole synchronisation this needs.
  const until = Date.now() + 250;
  while (Date.now() < until) {
    /* spin — this stand has no event loop to yield to */
  }
}

writeFileSync(
  slot,
  JSON.stringify({
    runId: "queue-hold",
    ticket: "",
    pid: process.pid,
    host: "dogfood",
    at: Date.now(),
  }),
  "utf8",
);
const backdated = (Date.now() - BACKDATE_MS) / 1000;
utimesSync(slot, backdated, backdated);
console.log(
  `queue-hold: slot taken (${statSync(slot).size} bytes, expires in ~30s)`,
);
