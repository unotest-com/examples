// The suite's `generate` command (unotest.config.mjs): app constants →
// unotest/generated/app-constants.json, which scenarios read with
// readJson(). Paths hang off this file, not the cwd, so the command
// works from wherever the runner starts it.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { hub } from "./app/constants.mjs";

const suite = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const out = join(suite, "generated", "app-constants.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${JSON.stringify({ hub }, null, 2)}\n`);
