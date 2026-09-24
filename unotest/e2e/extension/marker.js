// #8: the browser starts with an extension from `launch` in the config.
// No DSL function and no chrome-extension:// URL — the extension adds a
// node to the page, and the scenario sees it. Runs only through
// `pnpm dogfood:extension`, which turns `launch` on; the plain dogfood
// collections do not list it.

function test_extension_adds_its_marker() {
  step("Open the hub", () => {
    flow_open_hub();
  });

  step("The extension's marker is on the page", () => {
    flow_assert_extension_marker();
  });
}
