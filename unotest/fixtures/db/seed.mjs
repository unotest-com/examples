#!/usr/bin/env node
// Seeds the sqlite file that the `sandbox/db` dogfood scenario reads and
// writes through `dbQuery` / `dbExec`.
//
// A local file rather than a hosted database on purpose: a publicly
// writable database is a liability, and a file gives the same end-to-end
// coverage of the dialect wiring. Regenerated (dropped and re-created)
// before every run, so a scenario always starts from the same rows.

import { mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const here = dirname(fileURLToPath(import.meta.url));
export const DB_PATH = resolve(here, "dogfood.sqlite");

const SEED_WIDGETS = [
  { sku: "W-100", name: "Bracket", qty: 4, status: "active" },
  { sku: "W-200", name: "Gasket", qty: 0, status: "active" },
  { sku: "W-300", name: "Flange", qty: 12, status: "retired" },
];

export function seed(path = DB_PATH) {
  mkdirSync(dirname(path), { recursive: true });
  rmSync(path, { force: true });
  const db = new Database(path);
  db.exec(`
    CREATE TABLE widgets (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      sku    TEXT NOT NULL UNIQUE,
      name   TEXT NOT NULL,
      qty    INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active'
    );
  `);
  const insert = db.prepare(
    "INSERT INTO widgets (sku, name, qty, status) VALUES (?, ?, ?, ?)",
  );
  const insertAll = db.transaction((rows) => {
    for (const r of rows) insert.run(r.sku, r.name, r.qty, r.status);
  });
  insertAll(SEED_WIDGETS);
  db.close();
  return { path, rows: SEED_WIDGETS.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { path, rows } = seed();
  process.stdout.write(`db-seed: ${rows} widget(s) → ${path}\n`);
}
