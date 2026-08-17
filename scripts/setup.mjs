#!/usr/bin/env node
// Creates unotest/.env and unotest/.secrets from their .example twins,
// and tops up keys that a later release added.
//
// Runs on postinstall so `npm install && npm run dogfood` just works.
// Your values are never touched — only missing KEYS are appended.
//
// Skipping an existing file outright is what this used to do, and it
// broke every upgrade that introduced a variable: .env.example grew the
// key, .env stayed as it was, and the run died with
// `external variable "CATALOG_SEED" not found`. The fix was a manual
// `rm unotest/.env` — on the runner and for everyone who forked this.
import { appendFileSync, copyFileSync, existsSync, readFileSync } from "node:fs";

const KEY_LINE = /^([A-Z][A-Z0-9_]*)=/;

function keysIn(text) {
  return new Set(
    text.split("\n").map((line) => line.match(KEY_LINE)?.[1]).filter(Boolean),
  );
}

for (const target of ["unotest/.env", "unotest/.secrets"]) {
  const example = `${target}.example`;
  if (!existsSync(target)) {
    copyFileSync(example, target);
    console.log(`created ${target} from ${example}`);
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
    `${target}: added ${missing.map((line) => line.split("=")[0]).join(", ")}`,
  );
}
