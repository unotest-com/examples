# unotest examples

The real end-to-end suite we run against
[playground.unotest.com](https://playground.unotest.com) — the same one that
guards every unotest release. Copy anything here as a starting point for your
own tests.

Version `0.15.0`, pinned to `@unotest/web@0.15.0`. The suite and the
tool always ship together, so what you see here is what that release can do.

## Run it

```sh
npm install       # also creates unotest/.env and unotest/.secrets
npm run seed      # seeds the local sqlite fixture
npm run dogfood   # the full suite
npm run smoke     # a quick subset
```

No account to create: the scenarios drive a public playground, and the HTTP
fixtures they call live at [fixtures.unotest.com](https://fixtures.unotest.com).

`unotest/.env` and `unotest/.secrets` are gitignored, as yours should be.
Install creates them from the `.example` twins, and on a later release tops
them up with keys that were added — your own values are never touched.
`npm run setup` does the same by hand.

## What's inside

| Path | What it shows |
|---|---|
| `unotest/e2e/hub`, `catalog`, `dashboard` | everyday flows: navigation, forms, storage, login, CRUD, checkout |
| `unotest/e2e/big-table`, `drag-drop`, `clicks` | the hard parts — virtualized tables, drag and drop, double-click popups |
| `unotest/e2e/iframes`, `ws-live` | nested iframes and live WebSocket updates across tabs |
| `unotest/e2e/file-upload`, `sandbox` | uploads, and the sandbox primitives (`apiCall`, `db`, `shell`) |
| `unotest/e2e/negative`, `expect-fail` | scenarios that are supposed to fail, and how failures report |
| `unotest/fixtures` | the seed data, upload files and the HTTP fixture server |

## Notes

`unotest/.secrets.example` holds the playground's demo login. Those
credentials are public — hardcoded in the playground itself — and kept in a
secrets file on purpose, so every run exercises the masking machinery. Your
own `.secrets` stays out of git.

This repository is generated from our monorepo at release time; commits here
are automated. Found a problem? Open an issue — we'll fix it upstream and it
will land in the next release.
