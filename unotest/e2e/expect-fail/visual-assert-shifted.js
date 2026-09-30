// @expect-fail
// Deliberate failure: the baseline (visual-assert-shifted.screenshots/)
// was taken with the blue block at the left edge; the page now draws it
// 200px to the right. The run is red with the share of differing pixels,
// and the run keeps expected / actual / diff — the viewer shows all three
// on the failed step, with the snapshot to download as the new baseline.

function test_visual_assert_catches_a_shifted_block() {
  step("Open the page with the block moved", () => {
    goto('data:text/html,<body style="margin:0;background:%23ffffff"><div style="margin-left:200px;width:600px;height:400px;background:%233366ff"></div></body>');
  });

  step("The page matches its baseline within 5%", () => {
    assertScreenshot('layout', {maxDiffRatio: 0.05});
  });
}
