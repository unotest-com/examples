// Red twins (#449) of assertScreenshot's options, on the element form
// (locator, name, options): the coverage guard reads the options there.
// The baselines in red-twins/screenshot-assertions.screenshots/ are the
// page as
// test_the_page_matches_its_baselines draws it — written with
// `e2e red-twins/screenshot-assertions --test test_the_page_matches_its_baselines --update-screenshots`,
// never by a twin. Each twin draws the page changed in one place and calls
// the check where the option must make it fail; the same call with the
// option set right passes next to it. Flat colour blocks from a data: URL,
// no fonts: the same pixels on a laptop and on a Linux box.

// The clock block's colour and the colour of a block below the fold.
function blocks_page(clock, bottom) {
  return 'data:text/html,<body style="margin:0;background:%23ffffff">' +
    '<div data-testid="board" style="width:200px">' +
    '<div data-testid="card" style="width:200px;height:120px;background:%233366ff"></div>' +
    '<div data-testid="clock" style="width:80px;height:40px;background:%23' + clock + '"></div></div>' +
    '<div style="height:1600px"></div>' +
    '<div data-testid="footer" style="width:300px;height:60px;background:%23' + bottom + '"></div></body>';
}

function test_the_page_matches_its_baselines() {
  step("The unchanged page matches both baselines", () => {
    goto(blocks_page('ff9900', '22aa22'));
    assertScreenshot('page');
    assertScreenshot('full', {fullPage: true});
    assertScreenshot(getByTestId('board'), 'board');
  });
}

function test_mask_and_ignore_twins() {
  step("The clock changes colour", () => { goto(blocks_page('00cccc', '22aa22')); });

  step("mask: masking the card leaves the changed clock to fail it; masking the clock passes", () => {
    assert_failed_with(caught_message(() => assertScreenshot(getByTestId('board'), 'board', {mask: [getByTestId('card')]})), 'assertScreenshot');
    assertScreenshot(getByTestId('board'), 'board', {mask: [getByTestId('clock')]});
  });

  step("ignore: a rectangle off the clock fails it; the clock's rectangle passes", () => {
    assert_failed_with(caught_message(() => assertScreenshot(getByTestId('board'), 'board', {ignore: [{x: 0, y: 0, width: 200, height: 120}]})), 'assertScreenshot');
    assertScreenshot(getByTestId('board'), 'board', {ignore: [{x: 0, y: 120, width: 80, height: 40}]});
  });
}

function test_ratio_and_threshold_twins() {
  step("The clock changes colour", () => { goto(blocks_page('00cccc', '22aa22')); });

  step("maxDiffRatio: no share allowed fails; a share above the clock's 10 % passes", () => {
    assert_failed_with(caught_message(() => assertScreenshot(getByTestId('board'), 'board', {maxDiffRatio: 0})), 'assertScreenshot');
    assertScreenshot(getByTestId('board'), 'board', {maxDiffRatio: 0.15});
  });

  step("The clock's colour shifts by a few units", () => { goto(blocks_page('fa9505', '22aa22')); });

  step("threshold: 0 counts the shift and fails; the default 32 passes", () => {
    assert_failed_with(caught_message(() => assertScreenshot(getByTestId('board'), 'board', {threshold: 0})), 'assertScreenshot');
    assertScreenshot(getByTestId('board'), 'board', {threshold: 32});
  });
}

function test_full_page_twin() {
  step("The footer below the fold changes colour", () => { goto(blocks_page('ff9900', 'aa2222')); });

  step("fullPage: the whole page fails on the footer; the viewport alone passes", () => {
    assert_failed_with(caught_message(() => assertScreenshot('full', {fullPage: true})), 'assertScreenshot');
    assertScreenshot('page');
  });
}
