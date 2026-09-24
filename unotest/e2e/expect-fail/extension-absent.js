// @expect-fail
// Control for extension/marker: the same page without `launch`, so no
// extension is loaded and the marker must not appear. Run by
// scripts/dogfood-expect-fail.mjs — green here would mean the marker
// comes from somewhere other than the extension.

function test_no_extension_no_marker() {
  step("Open the hub", () => {
    flow_open_hub();
  });

  step("The extension's marker is on the page", () => {
    flow_assert_extension_marker();
  });
}
