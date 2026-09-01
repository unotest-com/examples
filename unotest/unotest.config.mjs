// Dogfood project: unotest tests run by unotest itself against
// playground.unotest.com. baseUrl auto-wires from APP_BASE_URL in
// unotest/.env (override per-env via unotest/.env.<name>).
//
// Sandbox primitives live here rather than in .env by design (a scenario
// must not be able to redirect the database or the API host). The API base
// still reads an env var so `--env local` can point at a locally running
// fixture server; the fallback is the deployed one.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The PROJECT root, one level up: this file lives in the suite package
// (`unotest/`), and every path below is written relative to the project —
// which is also what `shellCwd` has to be.
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** @type {Partial<import('@unotest/web').UnotestConfig>} */
export default {
  // What should run on its own, declared next to the tests it runs and
  // travelling with them. Nothing in @unotest/web executes this: cron is
  // run by the box that hosts the suite (see `docs/testing/dogfood.md`);
  // in a clone these are inert declarations — `unotest-web schedules`
  // prints them and says so.
  //
  // Hourly, like the box's runner loop has been since it replaced the
  // host cron. Seeding the sqlite fixture is the COLLECTION's `prepare:`
  // now (see `_collections/dogfood.yaml`), so a CI run and a run started
  // from the viewer prepare the same way a scheduled tick does — an entry
  // here would only be needed to prepare DIFFERENTLY on this tick.
  schedules: [
    {
      collection: "dogfood",
      cron: "0 * * * *",
    },
  ],
  sandbox: {
    apiBaseUrl: process.env.APP_API_BASE_URL ?? "https://fixtures.unotest.com",
    database: `sqlite:${join(root, "unotest/fixtures/db/dogfood.sqlite")}`,
    uploadDir: join(root, "unotest/fixtures/files"),
    shellCwd: root,
  },
};
