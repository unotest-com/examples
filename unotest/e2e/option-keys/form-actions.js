// The force / timeoutMs / delay options of fill, check, uncheck,
// selectOption, dragAndDrop and press (#526). Every target starts out not
// ready: a readonly field, a checkbox under a custom cover, a hidden
// select, a drag source under a cover, a field that does not exist yet.
// {timeoutMs: 700} fails on it; the "Arm" button makes it ready 300 ms
// later, and then {timeoutMs: 5000} waits it out: the long timeout is the
// short one's control. {force: true} acts on the not-ready target at once.
// Inline page (a data: URL, so no `#` in it: that starts the fragment).

function form_page_url() {
  return 'data:text/html,<style>body{margin:0;font:14px sans-serif}div,input,select,button{position:absolute}' +
    '.cb{left:20px;top:20px}.cb-cover{left:14px;top:14px;width:28px;height:28px;background:rgba(0,0,0,.2)}' +
    '.src{left:20px;top:80px;width:60px;height:30px;background:lightblue}.src-cover{left:20px;top:80px;width:60px;height:30px;background:rgba(0,0,0,.2)}' +
    '.dst{left:200px;top:80px;width:60px;height:30px;background:lightgreen}' +
    '.ro{left:20px;top:140px}.keys{left:20px;top:180px}.sel{left:20px;top:220px;visibility:hidden}' +
    '.arm{left:300px;top:20px}.log{left:300px;top:60px}.late-box{left:300px;top:140px}</style>' +
    '<input type="checkbox" class="cb" id="cb" data-testid="cb" checked><div class="cb-cover" id="cb-cover"></div>' +
    '<div class="src" id="src" data-testid="src">src</div><div class="src-cover" id="src-cover"></div>' +
    '<div class="dst" id="dst" data-testid="dst">dst</div>' +
    '<input class="ro" id="ro" data-testid="ro" readonly><input class="keys" id="keys" data-testid="keys">' +
    '<select class="sel" id="sel" data-testid="sel"><option>a</option><option>b</option></select>' +
    '<button class="arm" id="arm">Arm</button><div class="log" id="log" data-testid="log">none</div><div class="late-box" id="late-box"></div>' +
    '<script>const $ = (id) => document.getElementById(id), log = $("log");' +
    ' $("cb-cover").addEventListener("click", () => { $("cb").checked = !$("cb").checked; });' +
    ' let down = "";' +
    ' document.addEventListener("mousedown", (e) => { down = e.target.id; });' +
    ' document.addEventListener("mouseup", (e) => { if (down) log.textContent = "down " + down + " up " + e.target.id; down = ""; });' +
    ' let t = 0;' +
    ' $("keys").addEventListener("keydown", () => { t = performance.now(); });' +
    ' $("keys").addEventListener("keyup", () => { log.textContent = performance.now() - t >= 200 ? "key held long" : "key held short"; });' +
    ' $("arm").addEventListener("click", () => setTimeout(() => {' +
    '   $("ro").removeAttribute("readonly"); $("cb-cover").remove(); $("src-cover").remove();' +
    '   $("late-box").innerHTML = "<input data-testid=late>";' +
    ' }, 300));' +
    '</script>';
}

function assert_gave_up(message) {
  assertTrue(textContains(message, 'Timeout 700ms exceeded'), message);
}

function test_form_action_options_before_arm() {
  step("Open the page: nothing is ready", () => {
    goto(form_page_url());
    assertTrue(isChecked(getByTestId('cb')));
  });

  step("fill on the readonly field: {timeoutMs} gives up; {force} returns at once, the field keeps its value", () => {
    assert_gave_up(caught_message(() => fill(getByTestId('ro'), 'typed', {timeoutMs: 700})));
    fill(getByTestId('ro'), 'typed', {force: true});
    assertValue(getByTestId('ro'), '');
  });

  step("uncheck under the cover: {timeoutMs} gives up; {force} clicks the cover, whose handler unchecks", () => {
    assert_gave_up(caught_message(() => uncheck(getByTestId('cb'), {timeoutMs: 700})));
    assertTrue(isChecked(getByTestId('cb')));
    uncheck(getByTestId('cb'), {force: true});
    assertTrue(!isChecked(getByTestId('cb')));
  });

  step("check under the cover: {timeoutMs} gives up", () => {
    assert_gave_up(caught_message(() => check(getByTestId('cb'), {timeoutMs: 700})));
    assertTrue(!isChecked(getByTestId('cb')));
  });

  step("selectOption on the hidden select: without force it gives up, {force} selects", () => {
    assert_gave_up(caught_message(() => selectOption(getByTestId('sel'), 'b', {timeoutMs: 700})));
    selectOption(getByTestId('sel'), 'b', {force: true});
    assertValue(getByTestId('sel'), 'b');
  });

  step("dragAndDrop from the covered source: {timeoutMs} gives up; {force} presses on the cover", () => {
    assert_gave_up(caught_message(() => dragAndDrop(getByTestId('src'), getByTestId('dst'), {timeoutMs: 700})));
    dragAndDrop(getByTestId('src'), getByTestId('dst'), {force: true});
    assertText(getByTestId('log'), 'down src-cover up dst');
  });

  step("press: a plain press is short, {delay: 300} holds the key", () => {
    press(getByTestId('keys'), 'a');
    assertText(getByTestId('log'), 'key held short');
    press(getByTestId('keys'), 'b', {delay: 300});
    assertText(getByTestId('log'), 'key held long');
  });

  step("press on a field that is not there yet: {timeoutMs} gives up", () => {
    assert_gave_up(caught_message(() => press(getByTestId('late'), 'c', {timeoutMs: 700})));
  });

  step("Arm: in 300 ms every target is ready, and the long timeouts wait it out", () => {
    click(getByRole('button', {name: 'Arm'}));
    fill(getByTestId('ro'), 'typed', {timeoutMs: 5000});
    assertValue(getByTestId('ro'), 'typed');
    check(getByTestId('cb'), {timeoutMs: 5000});
    uncheck(getByTestId('cb'), {timeoutMs: 5000});
    assertTrue(!isChecked(getByTestId('cb')));
    dragAndDrop(getByTestId('src'), getByTestId('dst'), {timeoutMs: 5000});
    assertText(getByTestId('log'), 'down src up dst');
    press(getByTestId('late'), 'c', {timeoutMs: 5000});
    assertValue(getByTestId('late'), 'c');
  });
}
