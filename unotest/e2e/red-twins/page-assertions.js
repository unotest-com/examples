// Red twins (#449) of the page assertions and their options: each check is
// called on a state that breaks it and must fail with a message naming it;
// the same call on the right state passes next to it. A twin that stops
// failing means the check went quiet — the run says so in that step.

function twin_page() {
  return "data:text/html;charset=utf-8," +
    "<p role='status' data-state='open'>Saving</p>" +
    "<ul><li>alpha</li><li>beta</li></ul>" +
    "<label>Name <input value='Ann'></label>" +
    "<button hidden>Ghost</button><button>Shown</button>";
}

function test_attribute_twins() {
  step("Open the page", () => { goto(twin_page()); });

  step("assertAttribute fails on another value within its timeout, passes on its own", () => {
    const started = nowMs();
    assert_failed_with(caught_message(() => assertAttribute(getByRole('status'), 'data-state', 'closed', {timeoutMs: 300})), 'assertAttribute');
    assert_failed_in_time(started, 'assertAttribute');
    assertAttribute(getByRole('status'), 'data-state', 'open');
  });

  step("exact: a part of the value fails exact, passes contains", () => {
    assert_failed_with(caught_message(() => assertAttribute(getByRole('status'), 'data-state', 'op', {exact: true, timeoutMs: 300})), 'to equal "op"');
    assertAttribute(getByRole('status'), 'data-state', 'op', {exact: false});
  });

  step("not: the value it has fails not, another passes", () => {
    assert_failed_with(caught_message(() => assertAttribute(getByRole('status'), 'data-state', 'open', {not: true, timeoutMs: 300})), 'to not equal "open"');
    assertAttribute(getByRole('status'), 'data-state', 'closed', {not: true});
  });
}

function test_count_and_texts_twins() {
  step("Open the page", () => { goto(twin_page()); });

  step("assertCount fails on a wrong number within its timeout", () => {
    const started = nowMs();
    assert_failed_with(caught_message(() => assertCount(getByRole('listitem'), 3, {timeoutMs: 300})), 'assertCount');
    assert_failed_in_time(started, 'assertCount');
    assertCount(getByRole('listitem'), 2, {timeoutMs: 300});
  });

  step("assertTexts fails on a wrong item within its timeout", () => {
    const started = nowMs();
    assert_failed_with(caught_message(() => assertTexts(getByRole('listitem'), ['alpha', 'gamma'], {timeoutMs: 300})), 'assertTexts');
    assert_failed_in_time(started, 'assertTexts');
    assertTexts(getByRole('listitem'), ['alpha', 'beta'], {timeoutMs: 300});
  });

  step("exact: a part of each text fails exact, passes contains", () => {
    assert_failed_with(caught_message(() => assertTexts(getByRole('listitem'), ['alp', 'bet'], {exact: true, timeoutMs: 300})), 'to equal "alp"');
    assertTexts(getByRole('listitem'), ['alp', 'bet'], {exact: false});
  });
}

function test_visibility_and_value_twins() {
  step("Open the page", () => { goto(twin_page()); });

  step("assertVisible fails on a hidden element within its timeout", () => {
    const started = nowMs();
    assert_failed_with(caught_message(() => assertVisible(getByText('Ghost'), {timeoutMs: 300})), 'assertVisible');
    assert_failed_in_time(started, 'assertVisible');
    assertVisible(getByText('Shown'), {timeoutMs: 300});
  });

  step("assertHidden fails on a shown element within its timeout", () => {
    const started = nowMs();
    assert_failed_with(caught_message(() => assertHidden(getByText('Shown'), {timeoutMs: 300})), 'assertHidden');
    assert_failed_in_time(started, 'assertHidden');
    assertHidden(getByText('Ghost'), {timeoutMs: 300});
  });

  step("assertValue fails on another value within its timeout", () => {
    const started = nowMs();
    assert_failed_with(caught_message(() => assertValue(getByLabel('Name'), 'Bob', {timeoutMs: 300})), 'assertValue');
    assert_failed_in_time(started, 'assertValue');
    assertValue(getByLabel('Name'), 'Ann', {timeoutMs: 300});
  });

  step("assertNever fails the moment its condition holds", () => {
    assert_failed_with(caught_message(() => assertNever(() => count(getByRole('listitem')) == 2, {withinMs: 500})), 'assertNever');
    assertNever(() => count(getByRole('listitem')) == 5, {withinMs: 300});
  });
}
