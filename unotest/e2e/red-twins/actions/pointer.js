// Red twins (#449) of the pointer keys of click, doubleClick and hover. An
// action does not fail by itself, so each twin reads what the page saw:
// the call with the key, then a check of what the same call without the key
// leaves on the pad. That check fails, and its message quotes what only the
// key could have made — the button, the click count, the modifier, the
// point. `force` is the call on a button an overlay covers: {force: false}
// waits and fails naming the overlay, {force: true} lands on the overlay.
// The control after each twin: the key's own effect is what the pad shows.
// Inline page (a data: URL, so no `#` in it: that starts the fragment).

function pad_page() {
  return 'data:text/html,<style>body{margin:0}div,button{position:absolute}' +
    '.pad{left:0;top:0;width:200px;height:100px}.last{left:300px;top:0}' +
    '.box{left:0;top:200px;width:120px;height:40px}.cover{left:0;top:200px;width:120px;height:40px;background:rgba(0,0,0,.2)}' +
    '.seen{left:300px;top:200px}</style>' +
    '<div class="pad" data-testid="pad">pad</div><div class="last" data-testid="last">none</div>' +
    '<button class="box" data-testid="box">Box</button><div class="cover" id="cover"></div>' +
    '<div class="seen" data-testid="seen">cover: none</div>' +
    '<script>const $ = (id) => document.querySelector(id);' +
    ' const say = (e) => { $(".last").textContent = e.type + " b" + e.button + " d" + e.detail +' +
    '   " shift=" + e.shiftKey + " at " + Math.round(e.offsetX) + "," + Math.round(e.offsetY); };' +
    ' for (const t of ["click", "dblclick", "contextmenu", "mousemove"]) $(".pad").addEventListener(t, (e) => { e.preventDefault(); say(e); });' +
    ' for (const t of ["click", "dblclick", "mousemove"]) $(".cover").addEventListener(t, () => { $(".seen").textContent = "cover: " + t; });' +
    '</script>';
}

function test_click_pointer_twins() {
  step("Open the pad", () => { goto(pad_page()); });

  step("Twin: {button: 'right'} is not a left click", () => {
    assert_failed_with(caught_message(() => {
      click(getByTestId('pad'), {button: 'right'});
      assertText(getByTestId('last'), 'click b0 d1 shift=false at 100,50', {timeoutMs: 300});
    }), 'got "contextmenu b2 d0 shift=false at 100,50');
  });

  step("Control: {button: 'right'} is a context-menu click", () => {
    click(getByTestId('pad'), {button: 'right'});
    assertText(getByTestId('last'), 'contextmenu b2 d0 shift=false at 100,50');
  });

  step("Twin: {clickCount: 2} is not a single click", () => {
    assert_failed_with(caught_message(() => {
      click(getByTestId('pad'), {clickCount: 2});
      assertText(getByTestId('last'), 'click b0 d1 shift=false at 100,50', {timeoutMs: 300});
    }), 'got "dblclick b0 d2 shift=false at 100,50');
  });

  step("Control: {clickCount: 2} makes a double click", () => {
    click(getByTestId('pad'), {clickCount: 2});
    assertText(getByTestId('last'), 'dblclick b0 d2 shift=false at 100,50');
  });

  step("Twin: {modifiers: ['Shift']} is not a plain click", () => {
    assert_failed_with(caught_message(() => {
      click(getByTestId('pad'), {modifiers: ['Shift']});
      assertText(getByTestId('last'), 'click b0 d1 shift=false at 100,50', {timeoutMs: 300});
    }), 'got "click b0 d1 shift=true at 100,50');
  });

  step("Control: {modifiers: ['Shift']} holds Shift", () => {
    click(getByTestId('pad'), {modifiers: ['Shift']});
    assertText(getByTestId('last'), 'click b0 d1 shift=true at 100,50');
  });

  step("Twin: {position} is not the middle of the box", () => {
    assert_failed_with(caught_message(() => {
      click(getByTestId('pad'), {position: {x: 7, y: 9}});
      assertText(getByTestId('last'), 'click b0 d1 shift=false at 100,50', {timeoutMs: 300});
    }), 'got "click b0 d1 shift=false at 7,9');
  });

  step("Control: {position} clicks that point", () => {
    click(getByTestId('pad'), {position: {x: 7, y: 9}});
    assertText(getByTestId('last'), 'click b0 d1 shift=false at 7,9');
  });

  step("Twin: {force: false} on the covered button waits for the overlay and fails", () => {
    assert_failed_with(caught_message(() => click(getByTestId('box'), {force: false, timeoutMs: 700})), 'intercepts pointer events');
    assertText(getByTestId('seen'), 'cover: none');
  });

  step("Control: {force: true} clicks at that point, on the overlay", () => {
    click(getByTestId('box'), {force: true});
    assertText(getByTestId('seen'), 'cover: click');
  });
}

function test_double_click_and_hover_pointer_twins() {
  step("Open the pad", () => { goto(pad_page()); });

  step("Twin: doubleClick {modifiers: ['Shift']} is not a plain double click", () => {
    assert_failed_with(caught_message(() => {
      doubleClick(getByTestId('pad'), {modifiers: ['Shift']});
      assertText(getByTestId('last'), 'dblclick b0 d2 shift=false at 100,50', {timeoutMs: 300});
    }), 'got "dblclick b0 d2 shift=true at 100,50');
  });

  step("Control: doubleClick {modifiers: ['Shift']} holds Shift", () => {
    doubleClick(getByTestId('pad'), {modifiers: ['Shift']});
    assertText(getByTestId('last'), 'dblclick b0 d2 shift=true at 100,50');
  });

  step("Twin: doubleClick {position} is not the middle of the box", () => {
    assert_failed_with(caught_message(() => {
      doubleClick(getByTestId('pad'), {position: {x: 11, y: 13}});
      assertText(getByTestId('last'), 'dblclick b0 d2 shift=false at 100,50', {timeoutMs: 300});
    }), 'got "dblclick b0 d2 shift=false at 11,13');
  });

  step("Control: doubleClick {position} lands on that point", () => {
    doubleClick(getByTestId('pad'), {position: {x: 11, y: 13}});
    assertText(getByTestId('last'), 'dblclick b0 d2 shift=false at 11,13');
  });

  step("Twin: hover {position} is not the middle of the box", () => {
    assert_failed_with(caught_message(() => {
      hover(getByTestId('pad'), {position: {x: 30, y: 40}});
      assertText(getByTestId('last'), 'mousemove b0 d0 shift=false at 100,50', {timeoutMs: 300});
    }), 'got "mousemove b0 d0 shift=false at 30,40');
  });

  step("Control: hover {position} moves the pointer there", () => {
    hover(getByTestId('pad'), {position: {x: 30, y: 40}});
    assertText(getByTestId('last'), 'mousemove b0 d0 shift=false at 30,40');
  });

  step("Twin: hover {force: false} on the covered button fails on the overlay", () => {
    assert_failed_with(caught_message(() => hover(getByTestId('box'), {force: false, timeoutMs: 700})), 'intercepts pointer events');
    assertText(getByTestId('seen'), 'cover: none');
  });

  step("Control: hover {force: true} moves onto the overlay", () => {
    hover(getByTestId('box'), {force: true});
    assertText(getByTestId('seen'), 'cover: mousemove');
  });

  step("Twin: doubleClick {force: false} on the covered button fails on the overlay", () => {
    assert_failed_with(caught_message(() => doubleClick(getByTestId('box'), {force: false, timeoutMs: 700})), 'intercepts pointer events');
    assertText(getByTestId('seen'), 'cover: mousemove');
  });

  step("Control: doubleClick {force: true} lands on the overlay", () => {
    doubleClick(getByTestId('box'), {force: true});
    assertText(getByTestId('seen'), 'cover: dblclick');
  });
}
