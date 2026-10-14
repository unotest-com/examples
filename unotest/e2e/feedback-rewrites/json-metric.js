// Rewrite of standalone 2026-09-28 item 6 (#272): a field of the metrics
// JSON the page shows. The suite ran shell('node', '-e', …) per field
// (helper metric(metrics, field)), because no object lived outside a call.
// In plain JS: JSON.parse and a path walked with reduce.

function metric(text, path) {
  return path.split('.').reduce((value, key) => value?.[key], JSON.parse(text));
}

function test_metric_fields_from_page_json() {
  step("Read nested fields of the metrics the page prints", () => {
    goto("data:text/html,<pre data-testid='metrics'>{&quot;story&quot;:{&quot;frames&quot;:42,&quot;fps&quot;:59.94},&quot;errors&quot;:[]}</pre>");
    const metrics = getInnerText(getByTestId('metrics'));
    assertEqual(metric(metrics, 'story.frames'), 42);
    assertEqual(Math.round(metric(metrics, 'story.fps')), 60);
    assertEqual(metric(metrics, 'errors.length'), 0);
    assertEqual(metric(metrics, 'story.missing.deep'), undefined);
  });
}
