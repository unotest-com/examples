// Red twins (#449) of the element waits' keys: waitFor {state},
// waitForCount {exact}, waitForText {exact} and {state}, and the timeoutMs
// of each and of waitForAnimations. A key's twin waits for what the page
// never reaches under that key and fails naming it; the control waits for
// what the page has. timeoutMs proves itself by when the failure comes:
// well before the wait's own default.
// Inline page (a data: URL, so no `#` in it: that starts the fragment).

function waits_page() {
  return 'data:text/html,<style>@keyframes spin{to{transform:rotate(360deg)}}' +
    '.spin{display:inline-block;animation:spin 5s linear 1}</style>' +
    '<p>Saving draft</p><button hidden>Ghost</button>' +
    '<ul><li>alpha</li><li>beta</li><li>gamma</li></ul>' +
    '<span class="spin" data-testid="spinner">*</span>';
}

function test_wait_for_twins() {
  step("Open the page", () => { goto(waits_page()); });

  step("Twin: waitFor {state: 'visible'} on the hidden button fails within its timeoutMs", () => {
    const started = nowMs();
    assert_failed_with(caught_message(() => waitFor(getByText('Ghost'), {state: 'visible', timeoutMs: 300})), "getByText('Ghost') to be visible");
    assert_failed_in_time(started, 'waitFor');
  });

  step("Control: waitFor {state: 'attached'} finds it in the DOM", () => {
    waitFor(getByText('Ghost'), {state: 'attached', timeoutMs: 300});
  });
}

function test_wait_for_count_twins() {
  step("Open the page", () => { goto(waits_page()); });

  step("Twin: waitForCount {exact: true} is not 'at least' — three items fail exactly two", () => {
    const started = nowMs();
    assert_failed_with(caught_message(() => waitForCount(getByRole('listitem'), 2, {exact: true, timeoutMs: 300})), 'expected exactly 2 matching elements within 300ms, last saw 3');
    assert_failed_in_time(started, 'waitForCount');
  });

  step("Control: waitForCount {exact: false} takes three as at least two", () => {
    waitForCount(getByRole('listitem'), 2, {exact: false, timeoutMs: 300});
  });
}

function test_wait_for_text_twins() {
  step("Open the page", () => { goto(waits_page()); });

  step("Twin: waitForText {exact: true} does not take a part of the text", () => {
    const started = nowMs();
    assert_failed_with(caught_message(() => waitForText('Saving', {exact: true, timeoutMs: 300})), "getByText('Saving', { exact: true })");
    assert_failed_in_time(started, 'waitForText');
  });

  step("Control: waitForText {exact: false} takes the part", () => {
    waitForText('Saving', {exact: false, timeoutMs: 300});
  });

  step("Twin: waitForText {state: 'hidden'} fails on the text on screen", () => {
    assert_failed_with(caught_message(() => waitForText('Saving draft', {state: 'hidden', timeoutMs: 300})), 'first() to be hidden');
  });

  step("Control: waitForText {state: 'hidden'} on a text that is not there", () => {
    waitForText('Published', {state: 'hidden', timeoutMs: 300});
  });
}

function test_wait_for_animations_twin() {
  step("Open the page", () => { goto(waits_page()); });

  step("Twin: waitForAnimations on an endless spin fails within its timeoutMs", () => {
    const started = nowMs();
    assert_failed_with(caught_message(() => waitForAnimations(getByTestId('spinner'), {timeoutMs: 300})), 'waitForAnimations');
    assert_failed_in_time(started, 'waitForAnimations');
  });

  step("Control: a still element has nothing to wait for", () => {
    waitForAnimations(getByRole('list'), {timeoutMs: 300});
  });
}
