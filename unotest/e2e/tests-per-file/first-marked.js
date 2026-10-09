// The marker touching the FIRST test of a file is that test's, not the
// file's (#363): the leading comment block is separated by a blank line,
// so only test_first_fails_on_purpose is expected to fail.

// Red on purpose: the hub has no such text.
// @expect-fail
function test_first_fails_on_purpose() {
  step("Wait for a text the hub does not have", () => {
    goto('/');
    waitForText('Not On The Hub', {timeout: 1500});
  });
}

function test_second_passes() {
  step("Open the hub", () => {
    goto('/');
    waitForText('Stress-test browser');
  });
}
