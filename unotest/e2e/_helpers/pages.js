// Open a playground page described by a row of the fixture
// unotest/fixtures/data/playground-pages.jsonl and wait until its
// landmark text is on screen. Kept as a helper so data-driven scenarios
// stay a loop over rows, not a copy of goto/waitForText per row.
function flow_open_page(row) {
  goto(row.path);
  waitForText(row.text);
}

// Open a fixture page and leave a note about which row it came from —
// called from a helper on purpose: the viewer must pin the note to the
// entry-file line that called this flow, not to a helper frame it does
// not project.
function flow_open_page_noted(row) {
  note('fixture row', row);
  goto(row.path);
  waitForText(row.text);
  note('landed on', getUrl());
}

// Stage 8 (Trace): a helper that calls another helper, both with steps
// inside. The Steps view projects nothing below the entry file; the Trace
// view must show flow_visit_and_verify → flow_open_page → goto/waitForText
// as nested frames with their own step envelopes.
function flow_verify_page(row) {
  step("Landmark text is on screen", () => {
    assertVisible(getByText(row.text).first());
  });
  step("URL matches the fixture path", () => {
    assertTrue(textContains(getUrl(), row.path), getUrl());
  });
}

function flow_visit_and_verify(row) {
  step("Open the page", () => {
    flow_open_page(row);
  });
  flow_verify_page(row);
  note('visited', row.id);
}
