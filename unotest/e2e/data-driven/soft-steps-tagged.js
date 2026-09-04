// Data-driven gate, stage 5: a step carries the id of the row it checks
// as a tag, and a soft step that PASSES leaves the verdict green. The loop
// lives inside an outer step (test bodies are steps only); the tagged
// steps nest inside it — the shape the viewer groups by.

function test_soft_steps_tagged_from_jsonl() {
  step("Every enabled page from the fixture", () => {
    pages = 'unotest/fixtures/data/playground-pages.jsonl';
    ids = ['hub', 'clicks', 'drag-drop'];
    for (i = 0; i < 3; i = i + 1) {
      id = ids[i];
      row = readJsonLine(pages, {id: id, enabled: true});

      step("Page from fixture", {tag: row.id}, () => {
        flow_open_page(row);
        screenshot(row.id);
      });

      step.soft("Optional check", {tag: textJoin(['opt-', row.id])}, () => {
        assertTrue(textContains(getUrl(), row.path), getUrl());
      });
    }
  });

  step("An untagged step still lives next to tagged ones", () => {
    disabled = readJsonLine(pages, {id: 'iframes', enabled: false});
    assertTrue(disabled.enabled == false, json(disabled));
  });
}
