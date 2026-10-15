// The pointer options of click / doubleClick / hover, each checked by what
// the page saw (#526): which button, how many clicks, which modifier, where
// in the box. A control beside each: the same call without the key reads
// differently. `force` is the click on a button an overlay covers — without
// it the call waits for the overlay and fails; with it the click lands at
// that point, so the overlay is what receives it.
// Inline page (a data: URL, so no `#` in it: that starts the fragment):
// the playground has no element that reports the event it got.

function pointer_page_url() {
  return 'data:text/html,<style>body{margin:0;font:14px sans-serif}' +
    '.pad{position:absolute;left:20px;top:20px;width:200px;height:100px;background:lightblue}' +
    '.wrap{position:absolute;left:20px;top:160px;width:120px;height:40px}' +
    '.covered{width:120px;height:40px}' +
    '.cover{position:absolute;left:0;top:0;width:120px;height:40px;background:rgba(0,0,0,.2)}' +
    '.last,.cover-log{position:absolute;left:260px}.last{top:20px}.cover-log{top:160px}</style>' +
    '<div id="pad" class="pad" data-testid="pad">pad</div>' +
    '<div class="wrap"><button id="covered" class="covered" data-testid="covered">Covered</button><div id="cover" class="cover" data-testid="cover"></div></div>' +
    '<div id="last" class="last" data-testid="last">none</div><div id="cover-log" class="cover-log" data-testid="cover-log">cover: 0</div>' +
    '<script>const last = document.getElementById("last");' +
    ' const say = (e) => { last.textContent = e.type + " b" + e.button + " d" + e.detail +' +
    '   " shift=" + e.shiftKey + " at " + Math.round(e.offsetX) + "," + Math.round(e.offsetY); };' +
    ' const pad = document.getElementById("pad");' +
    ' for (const t of ["click", "dblclick", "contextmenu", "mousemove"]) pad.addEventListener(t, (e) => { if (t === "contextmenu") e.preventDefault(); say(e); });' +
    ' let n = 0, moved = ""; const cover = document.getElementById("cover"), log = document.getElementById("cover-log");' +
    ' cover.addEventListener("click", () => { n++; log.textContent = "cover: " + n + moved; });' +
    ' cover.addEventListener("mousemove", () => { moved = ", hovered"; log.textContent = "cover: " + n + moved; });' +
    ' document.getElementById("covered").addEventListener("click", () => { last.textContent = "covered button clicked"; });' +
    '</script>';
}

function test_pointer_options_click() {
  step("Open the pad", () => {
    goto(pointer_page_url());
    assertText(getByTestId('last'), 'none');
  });

  step("A plain click: left button, one click, no modifier, the middle of the box", () => {
    click(getByTestId('pad'));
    assertText(getByTestId('last'), 'click b0 d1 shift=false at 100,50');
  });

  step("{button: 'right'} is a context-menu click with button 2", () => {
    click(getByTestId('pad'), {button: 'right'});
    assertText(getByTestId('last'), 'contextmenu b2 d0 shift=false at 100,50');
  });

  step("{clickCount: 2} makes the second click of a pair", () => {
    click(getByTestId('pad'), {clickCount: 2});
    assertText(getByTestId('last'), 'dblclick b0 d2 shift=false at 100,50');
  });

  step("{modifiers: ['Shift']} holds Shift through the click", () => {
    click(getByTestId('pad'), {modifiers: ['Shift']});
    assertText(getByTestId('last'), 'click b0 d1 shift=true at 100,50');
  });

  step("{position} clicks that point of the box, not its middle", () => {
    click(getByTestId('pad'), {position: {x: 7, y: 9}});
    assertText(getByTestId('last'), 'click b0 d1 shift=false at 7,9');
  });

  step("A covered button: without force the click waits and fails, the overlay untouched", () => {
    const message = caught_message(() => click(getByTestId('covered'), {timeoutMs: 700}));
    assertTrue(textContains(message, 'intercepts pointer events'), message);
    assertText(getByTestId('cover-log'), 'cover: 0');
  });

  step("{force: true} clicks at once, at that point: the overlay receives it", () => {
    click(getByTestId('covered'), {force: true});
    assertText(getByTestId('cover-log'), 'cover: 1, hovered');
  });
}

function test_pointer_options_double_click_and_hover() {
  step("Open the pad", () => {
    goto(pointer_page_url());
  });

  step("doubleClick: plain, then {modifiers} and {position}", () => {
    doubleClick(getByTestId('pad'));
    assertText(getByTestId('last'), 'dblclick b0 d2 shift=false at 100,50');
    doubleClick(getByTestId('pad'), {modifiers: ['Shift'], position: {x: 11, y: 13}});
    assertText(getByTestId('last'), 'dblclick b0 d2 shift=true at 11,13');
  });

  step("hover: the middle by default, {position} moves the pointer there", () => {
    hover(getByTestId('pad'));
    assertText(getByTestId('last'), 'mousemove b0 d0 shift=false at 100,50');
    hover(getByTestId('pad'), {position: {x: 30, y: 40}});
    assertText(getByTestId('last'), 'mousemove b0 d0 shift=false at 30,40');
  });

  step("hover on the covered button: {timeoutMs} fails without force, {force} moves there", () => {
    const message = caught_message(() => hover(getByTestId('covered'), {timeoutMs: 700}));
    assertTrue(textContains(message, 'intercepts pointer events'), message);
    assertText(getByTestId('cover-log'), 'cover: 0');
    hover(getByTestId('covered'), {force: true});
    assertText(getByTestId('cover-log'), 'cover: 0, hovered');
  });

  step("doubleClick on the covered button: {timeoutMs} fails without force, {force} lands", () => {
    const message = caught_message(() => doubleClick(getByTestId('covered'), {timeoutMs: 700}));
    assertTrue(textContains(message, 'intercepts pointer events'), message);
    assertText(getByTestId('cover-log'), 'cover: 0, hovered');
    doubleClick(getByTestId('covered'), {force: true});
    assertText(getByTestId('cover-log'), 'cover: 2, hovered');
  });
}
