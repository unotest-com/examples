// The data-driven example of the docs guide "Port a @playwright/test
// spec": one test, the cases in a loop, each case a soft step tagged with
// its id — once from a table in the scenario, once from a JSONL file.
// Keep it in step with the guide.

function test_pages_from_a_table_and_a_file() {
  step("Cases from a table in the scenario", () => {
    cases = [
      {id: 'hub', path: '/', text: 'Stress-test browser'},
      {id: 'clicks', path: '/scenarios/clicks', text: 'Click me'},
      {id: 'drag-drop', path: '/scenarios/drag-drop', text: 'Backlog'},
    ];
    for (i = 0; i < cases.length; i = i + 1) {
      c = cases[i];
      step.soft("Page opens", {tag: c.id}, () => {
        goto(c.path);
        waitForText(c.text);
      });
    }
  });

  step("Cases from a JSONL file", () => {
    ids = ['hub', 'clicks', 'drag-drop'];
    for (i = 0; i < ids.length; i = i + 1) {
      row = readJsonLine('unotest/fixtures/data/playground-pages.jsonl', {id: ids[i], enabled: true});
      step.soft("Page opens", {tag: row.id}, () => {
        goto(row.path);
        waitForText(row.text);
      });
    }
  });
}
