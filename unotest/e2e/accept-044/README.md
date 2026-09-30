# Приёмка 0.44, линия «язык»: #198 и #211+#167

Тикет — `docs/tasks/2026-09-27-accept-0.44-language.md`. Исполняемая
половина — `scripts/acceptance/0.44-language/` (`run.mjs` + блоки
`lang`, `viewport-cli`, `viewport-mcp`), сценарии языка и
`setViewport` — здесь, варианты конфига окна — в мини-проекте
`scripts/acceptance/0.44-language/project/` (переменная `ACC_WINDOW`).

Запуск из корня дерева (сначала `pnpm compile`):

```sh
node scripts/acceptance/0.44-language/run.mjs            # все три блока
node scripts/acceptance/0.44-language/run.mjs lang       # один блок
ACC_ONLY=167-1 node scripts/acceptance/0.44-language/viewport-mcp.mjs
ACC_ROOT=<worktree слитого release/0.44> node …/run.mjs  # чужое дерево
```

Снимки MCP для глаз (420 и 1280) — `scripts/acceptance/0.44-language/out/`.

| Строка | Критерий | Файл | Судит |
|---|---|---|---|
| 198-1 | #198 п.1 `s.length === 6` | `accept-044/str-length.js` | lint + прогон |
| 198-2 | #198 п.2 `trim`/`includes`/`startsWith` в assert и if | `accept-044/str-methods.js` | lint + прогон |
| 198-3 | #198 п.3 `a.b[0].c` | `accept-044/field-index.js` | lint + прогон |
| 198-4 | #198 п.4 `h = {…}` → `echo_object(h)` | `accept-044/object-literal.js`, `_helpers/accept-044.js` | lint + прогон |
| 198-5 | #198 п.5 `s.padStart` → отказ lint с методом и списком | `project/unotest/e2e/probe/pad-start.js` | lint (контроль — 198-2) |
| 198-7 | #198 п.7 compat | все старые сценарии + `dogfood-smoke` | lint + коллекция |
| 211-1 | #211 п.1 конфиг 390×844×2 → PNG 780×1688 | `probe/shot.js`, `ACC_WINDOW=scale2` | размер PNG |
| 211-1к | контроль без поля → 1280×720 | `probe/shot.js` | размер PNG |
| 211-2 | #211 п.2 `setViewport({420, 900})` → 420×900 | `accept-044/set-viewport.js` | размер PNG до/после |
| 211-2н | `setViewport` с масштабом → отказ с подсказкой | `probe/scale-in-set-viewport.js` | текст отказа (контроль — 211-2) |
| 211-4 | #211 п.4 `device: "iPhone 14"` → 1170×1992 | `probe/shot.js`, `ACC_WINDOW=iphone14` | размер PNG |
| 211-4н | неизвестный пресет → отказ с именем | `probe/shot.js`, `ACC_WINDOW=unknown-device` | текст отказа |
| 167-1 | #167 п.1 `new_context` 420×900 | `viewport-mcp.mjs` | PNG ответа, файл `out/mcp-420.png` |
| 167-1к | контроль `new_context {}` → 1280×720 | `viewport-mcp.mjs` | `out/mcp-1280.png` |
| 167-2 | #167 п.2 опечатка `viewpor` → отказ с полем и известными | `viewport-mcp.mjs` | текст отказа (контроль — 167-1) |
| 167-3 | #167 п.3 `explore_start` с viewport | `viewport-mcp.mjs` | PNG ответа |
| 167-3н | `explore_start` с опечаткой → отказ | `viewport-mcp.mjs` | текст отказа; на базе уже зелёная (strict-схема) — страж регресса |
| 211-3 | #211 п.3 `new_context` 390×844×2 → 780×1688 | `viewport-mcp.mjs` | PNG ответа |
| 211-4м | `new_context {device: "iPhone 14"}` → 1170×1992 | `viewport-mcp.mjs` | PNG ответа |

### Второй заход: #212 (блок `clock`) и #196 (блок `teardown`)

Сценарии — в мини-проектах `project-clock/` и `project-teardown/`,
страницы (`clock.html`, `typing.html`, `a.html`, `b.html`) отдаёт сам
харнесс на свободном порту. Часы зовутся только через обёртку
`project-clock/unotest/e2e/_helpers/clock.js`; имена MCP-действий —
`CLOCK_ACTIONS` в `lib.mjs`. Форма вызова поменяется — правка в этих
двух местах.

| Строка | Критерий | Файл |
|---|---|---|
| 212-1…3 | freeze / tick(1500) / run | `clock/freeze.js`, `tick.js`, `run.js` |
| 212-к | контроль: без часов время живое | `clock/live.js` |
| 212-4, 212-4к | зона Madrid + es-ES / без поля — зона процесса (`TZ=America/New_York`) | `clock/zone.js`, `zone-plain.js` |
| 212-5 | «печатает» при freeze: два прогона, PNG побайтно равны | `clock/typing.js` |
| 212-6 | MCP `clock_freeze`/`clock_tick` → запись → `run_test` | `clock.mjs` |
| 196-1…6 | откат при падении включения, LIFO, вердикт, `teardownFailures`, кадр A/B, `maxDurationMs` | `td/*.js` |
| 196-7, 7в, 7к | `return` и вложенный teardown → `teardown-shape`; контроль | `lint/*.js` |
| 196-8а…г | Stop во время шага, на паузе падения, на точке останова, второй Stop | `stop-harness.mjs` + `td/*.js` |
| 196-9, 196-12 | compat → 198-7; protocol → тесты dev | — |
| 196-10, 10д | потолок `teardownTimeoutMs` виден; dogfood-сценарий есть | `td/slow-teardown.js` |
| 196-11, 11п | своя переменная `teardown` → конфликт; поиск имени в dogfood/feedback | `lint/own-teardown.js` |
| 196-13 | секрет в откате маскируется (`‹secret:ACC_MASK_PROBE›`) | `td/secret.js` |

Stop-харнесс из терминала (для dev по #196 и кадра паузы):

```sh
APP_BASE_URL=<адрес> node scripts/acceptance/0.44-language/stop-harness.mjs \
  <проект> <feature/name> [pause|breakpoint=L:C|during] [--second-stop]
```

### Третий заход: #197 (блок `context`) и #210 (блок `visual`)

Сценарии — в мини-проектах `project-context/` и `project-visual/`: до
слияния фич они красят lint и не должны задевать dogfood.

- **#197.** Тред поддержки — фикстура ДЕРЕВА
  (`unotest/fixtures/api/support-thread.mjs`); харнесс импортирует её
  маршрут в свой сервер страниц, поэтому тред и `a/b/tabs/storage.html`
  живут на одном origin. Хелперы (`flow_login`) — dogfood-набора дерева
  через `helpersDir`, не копия. Колесо (#193): `take_wheel` на паузе в
  контексте 1 → `get_url` = `b.html`; контроль — пауза в контексте 0.
- **#210.** Эталоны рисует харнесс (`drawPng` в `lib.mjs`) перед каждой
  строкой, в `vis/<сценарий>.screenshots/` (вне git): снятый браузером
  эталон совпал бы со снимком по построению. Окно 400×250 = 100 000 px,
  поэтому 4.9 / 5.0 / 5.1 % — блоки 49/50/51×100. Недоверенный эталон —
  `claimedPng(50000, 50000)` и `bombPng` (IDAT на 64 МБ нулей при IHDR
  400×250). Потолок бандла — временный 130-МБ «эталон» в корне дерева,
  адрес бокса — мёртвый порт: отказ обязан прийти раньше соединения.

Ручные строки после слияния: #210 п.7б/8/12 — box-lab; #197 п.12/15в —
виюер глазами. Строки «см.» называют, где живёт доказательство.

Вне харнесса: #198 п.6 и #211 п.5 (доки) — сборка `packages/docs`;
#167 п.4 (кабинет на 320 через MCP без правки конфига) — глазами
сессионным MCP после слияния, снимок в вердикте.

Сценарии этой папки до слияния #198 и #211 красные на lint — сливать
ветку харнесса только после обеих, иначе `pnpm dogfood` красный.
