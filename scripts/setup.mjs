#!/usr/bin/env node
// Creates unotest/.env and unotest/.secrets from their .example twins.
//
// Runs on postinstall so `npm install && npm run dogfood` just works,
// and never overwrites a file you already edited.
import { copyFileSync, existsSync } from "node:fs";

for (const target of ["unotest/.env", "unotest/.secrets"]) {
  if (existsSync(target)) continue;
  copyFileSync(`${target}.example`, target);
  console.log(`created ${target} from ${target}.example`);
}
