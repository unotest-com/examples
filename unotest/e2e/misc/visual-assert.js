// assertScreenshot against a baseline in the repo
// (misc/visual-assert.screenshots/). The page is drawn from a data: URL —
// flat colour blocks, no fonts — so the baseline is the same picture on a
// laptop and on a Linux box.

function test_visual_assert_matches_the_baseline() {
  step("Open a page with known colour blocks", () => {
    goto('data:text/html,<body style="margin:0;background:%23ffffff"><div data-testid="card" style="width:200px;height:120px;background:%233366ff"></div><div data-testid="clock" style="width:80px;height:40px;background:%23ff9900"></div></body>');
  });

  step("The card element matches its baseline", () => {
    assertScreenshot(getByTestId('card'), 'card');
  });

  step("The page matches, the clock block masked", () => {
    assertScreenshot('page', {maxDiffRatio: 0.05, threshold: 32, mask: [getByTestId('clock')]});
  });
}
