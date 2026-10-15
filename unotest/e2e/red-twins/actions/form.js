// Red twins (#449) of the force keys of fill, check, uncheck, selectOption
// and dragAndDrop, and of press {delay}. Each target is not ready for the
// action: a readonly field, a checkbox and a drag source under a cover, a
// hidden select. {force: false} waits for it and fails naming why; the
// control {force: true} acts at once. press {delay} holds the key: a check
// of the short press fails, quoting the long one.
// Inline page (a data: URL, so no `#` in it: that starts the fragment).

function form_page() {
  return 'data:text/html,<style>body{margin:0}div,input,select{position:absolute}' +
    '.cb{left:20px;top:20px}.cb-cover{left:14px;top:14px;width:28px;height:28px;background:rgba(0,0,0,.2)}' +
    '.src{left:20px;top:80px;width:60px;height:30px}.src-cover{left:20px;top:80px;width:60px;height:30px;background:rgba(0,0,0,.2)}' +
    '.dst{left:200px;top:80px;width:60px;height:30px}' +
    '.ro{left:20px;top:140px}.keys{left:20px;top:180px}.sel{left:20px;top:220px;visibility:hidden}.log{left:300px;top:20px}</style>' +
    '<input type="checkbox" class="cb" data-testid="cb"><div class="cb-cover" id="cb-cover"></div>' +
    '<div class="src" id="src" data-testid="src">src</div><div class="src-cover" id="src-cover"></div>' +
    '<div class="dst" id="dst" data-testid="dst">dst</div>' +
    '<input class="ro" data-testid="ro" readonly><input class="keys" data-testid="keys">' +
    '<select class="sel" data-testid="sel"><option>a</option><option>b</option></select>' +
    '<div class="log" data-testid="log">none</div>' +
    '<script>const $ = (s) => document.querySelector(s), log = $(".log");' +
    ' $(".cb-cover").addEventListener("click", () => { $(".cb").checked = !$(".cb").checked; });' +
    ' let down = "";' +
    ' document.addEventListener("mousedown", (e) => { down = e.target.id; });' +
    ' document.addEventListener("mouseup", (e) => { if (down) log.textContent = "down " + down + " up " + e.target.id; down = ""; });' +
    ' let t = 0;' +
    ' $(".keys").addEventListener("keydown", () => { t = performance.now(); });' +
    ' $(".keys").addEventListener("keyup", () => { log.textContent = performance.now() - t >= 200 ? "key held long" : "key held short"; });' +
    '</script>';
}

function test_fill_and_select_force_twins() {
  step("Open the page", () => { goto(form_page()); });

  step("Twin: fill {force: false} waits for the readonly field to be editable", () => {
    assert_failed_with(caught_message(() => fill(getByTestId('ro'), 'typed', {force: false, timeoutMs: 700})), 'not editable');
  });

  step("Control: fill {force: true} returns at once", () => {
    fill(getByTestId('ro'), 'typed', {force: true, timeoutMs: 700});
  });

  step("Twin: selectOption {force: false} waits for the hidden select", () => {
    assert_failed_with(caught_message(() => selectOption(getByTestId('sel'), 'b', {force: false, timeoutMs: 700})), 'not visible');
    assertValue(getByTestId('sel'), 'a');
  });

  step("Control: selectOption {force: true} selects", () => {
    selectOption(getByTestId('sel'), 'b', {force: true, timeoutMs: 700});
    assertValue(getByTestId('sel'), 'b');
  });
}

function test_check_force_twins() {
  step("Open the page", () => { goto(form_page()); });

  step("Twin: check {force: false} waits for the cover to go", () => {
    assert_failed_with(caught_message(() => check(getByTestId('cb'), {force: false, timeoutMs: 700})), 'intercepts pointer events');
    assertTrue(!isChecked(getByTestId('cb')), 'check without force ticked the box');
  });

  step("Control: check {force: true} clicks the cover, whose handler ticks", () => {
    check(getByTestId('cb'), {force: true, timeoutMs: 700});
    assertTrue(isChecked(getByTestId('cb')), 'check {force: true} left the box empty');
  });

  step("Twin: uncheck {force: false} waits for the cover to go", () => {
    assert_failed_with(caught_message(() => uncheck(getByTestId('cb'), {force: false, timeoutMs: 700})), 'intercepts pointer events');
    assertTrue(isChecked(getByTestId('cb')), 'uncheck without force cleared the box');
  });

  step("Control: uncheck {force: true} clicks the cover, whose handler clears", () => {
    uncheck(getByTestId('cb'), {force: true, timeoutMs: 700});
    assertTrue(!isChecked(getByTestId('cb')), 'uncheck {force: true} left the box ticked');
  });
}

function test_drag_and_drop_force_twin() {
  step("Open the page", () => { goto(form_page()); });

  step("Twin: dragAndDrop {force: false} waits for the cover on the source", () => {
    assert_failed_with(caught_message(() => dragAndDrop(getByTestId('src'), getByTestId('dst'), {force: false, timeoutMs: 700})), 'intercepts pointer events');
    assertText(getByTestId('log'), 'none');
  });

  step("Control: dragAndDrop {force: true} presses on the cover", () => {
    dragAndDrop(getByTestId('src'), getByTestId('dst'), {force: true, timeoutMs: 700});
    assertText(getByTestId('log'), 'down src-cover up dst');
  });
}

function test_press_delay_twin() {
  step("Open the page", () => { goto(form_page()); });

  step("Twin: press {delay: 300} is not a short press", () => {
    const message = caught_message(() => {
      press(getByTestId('keys'), 'a', {delay: 300});
      assertText(getByTestId('log'), 'key held short', {timeoutMs: 300});
    });
    assert_failed_with(message, 'got "key held long"');
  });

  step("Control: press {delay: 300} holds the key", () => {
    press(getByTestId('keys'), 'b', {delay: 300});
    assertText(getByTestId('log'), 'key held long');
  });
}
