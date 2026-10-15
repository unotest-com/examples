// Red twins (#449) of selectOption's {value}, {label} and {index}. The
// options cross their values and labels ("One" is the value of the option
// labelled "Two" and the other way round; "2" is the value of the fourth),
// so each key picks an option the other readings of the same word would
// not. The twin checks what another reading would have picked; it fails,
// and the message quotes the option only that key selects. The page logs
// value, label and index of the selection.
// Inline page (a data: URL, so no `#` in it: that starts the fragment).

function crossed_select_page() {
  return 'data:text/html,<select data-testid="pick">' +
    '<option value="none">none</option>' +
    '<option value="One">Two</option>' +
    '<option value="Two">One</option>' +
    '<option value="2">Four</option>' +
    '</select><p data-testid="picked">none</p>' +
    '<script>const pick = document.querySelector("select");' +
    ' pick.addEventListener("change", () => { const o = pick.selectedOptions[0];' +
    '   document.querySelector("p").textContent = o.value + " " + o.text + " " + pick.selectedIndex; });' +
    '</script>';
}

function test_select_option_by_twins() {
  step("Open the crossed select", () => { goto(crossed_select_page()); });

  step("Twin: {value: 'One'} is not the option labelled One", () => {
    assert_failed_with(caught_message(() => {
      selectOption(getByTestId('pick'), {value: 'One'});
      assertText(getByTestId('picked'), 'Two One 2', {timeoutMs: 300});
    }), 'got "One Two 1"');
  });

  step("Control: {value: 'One'} picks the option of that value", () => {
    selectOption(getByTestId('pick'), {value: 'One'});
    assertText(getByTestId('picked'), 'One Two 1');
  });

  step("Twin: {label: 'One'} is not the option of value One", () => {
    assert_failed_with(caught_message(() => {
      selectOption(getByTestId('pick'), {label: 'One'});
      assertText(getByTestId('picked'), 'One Two 1', {timeoutMs: 300});
    }), 'got "Two One 2"');
  });

  step("Control: {label: 'One'} picks the option of that label", () => {
    selectOption(getByTestId('pick'), {label: 'One'});
    assertText(getByTestId('picked'), 'Two One 2');
  });

  step("Twin: {index: 2} is not the option of value 2", () => {
    selectOption(getByTestId('pick'), {value: 'none'});
    assert_failed_with(caught_message(() => {
      selectOption(getByTestId('pick'), {index: 2});
      assertText(getByTestId('picked'), '2 Four 3', {timeoutMs: 300});
    }), 'got "Two One 2"');
  });

  step("Control: {index: 2} picks the third option", () => {
    selectOption(getByTestId('pick'), {value: 'none'});
    selectOption(getByTestId('pick'), {index: 2});
    assertText(getByTestId('picked'), 'Two One 2');
  });
}
