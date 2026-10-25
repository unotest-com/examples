// A file of tests that share a flow with arguments (#631). A run of the
// file plays its two tests; the flow is a step they call, and played on
// its own — with no label to look for — it would fail. Two passed and
// nothing else is the verdict.

function flow_open_scenario(label, path) {
  goto('/');
  click(getByRole('link', {name: label, exact: true}));
  assertUrl(path);
}

function test_big_table_from_the_hub() {
  step("Open Big Table from the hub", () => {
    flow_open_scenario('Big Table', '/scenarios/big-table');
  });
}

function test_nested_iframes_from_the_hub() {
  step("Open Nested Iframes from the hub", () => {
    flow_open_scenario('Nested Iframes', '/scenarios/iframes');
  });
}
