#!/usr/bin/env node
// Creates unotest/.env and unotest/.secrets from their .example twins,
// and tops up keys that a later release added.
//
// Runs on the SUITE's postinstall, so `npm install --prefix unotest`
// both installs the suite and leaves it runnable.
// Your values are never touched — only missing KEYS are appended.
//
// Skipping an existing file outright is what this used to do, and it
// broke every upgrade that introduced a variable: .env.example grew the
// key, .env stayed as it was, and the run died with
// `external variable "CATALOG_SEED" not found`. The fix was a manual
// `rm unotest/.env` — on the runner and for everyone who forked this.
import { appendFileSync, copyFileSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Anchored to this file, never to cwd: npm runs a lifecycle script from
// the package directory but `npm run setup` from the repository root
// runs it from there, and a relative path would mean two different files.
const SUITE = join(dirname(fileURLToPath(import.meta.url)), "..");

const KEY_LINE = /^([A-Z][A-Z0-9_]*)=/;

function keysIn(text) {
  return new Set(
    text.split("\n").map((line) => line.match(KEY_LINE)?.[1]).filter(Boolean),
  );
}

for (const name of [".env", ".secrets"]) {
  const target = join(SUITE, name);
  const example = `${target}.example`;
  if (!existsSync(target)) {
    copyFileSync(example, target);
    console.log(`created unotest/${name} from unotest/${name}.example`);
    continue;
  }
  const present = keysIn(readFileSync(target, "utf8"));
  const missing = readFileSync(example, "utf8")
    .split("\n")
    .filter((line) => {
      const key = line.match(KEY_LINE)?.[1];
      return key !== undefined && !present.has(key);
    });
  if (missing.length === 0) continue;
  appendFileSync(
    target,
    `\n# added by setup — new in this release\n${missing.join("\n")}\n`,
  );
  console.log(
    `unotest/${name}: added ${missing.map((line) => line.split("=")[0]).join(", ")}`,
  );
}
