// The ternary `cond ? a : b` on values the page produced: as a value, in
// a call argument, nested, and as a guard whose other branch must not run.

function test_ternary() {
  step("a ternary picks a value from what the page shows", () => {
    goto('/');
    waitForText('Stress-test browser');
    shown = isVisible(getByText('Stress-test browser'));
    state = shown ? 'visible' : 'hidden';
    assertTrue(state === 'visible', state);
    assertTrue((getTitle().trim().length > 0 ? 'titled' : 'blank') === 'titled', getTitle());
  });

  step("nested to the right, and in an argument", () => {
    sizes = [];
    for (i = 0; i < 3; i = i + 1) {
      sizes.push(i == 0 ? 'none' : i == 1 ? 'one' : 'many');
    }
    assertTrue(json(sizes) === '["none","one","many"]', json(sizes));
    log(sizes.length > 2 ? 'three sizes' : 'fewer sizes');
  });

  step("only the picked branch runs", () => {
    row = null;
    name = row == null ? 'nobody' : row.name;
    assertTrue(name === 'nobody', name);
    url = getUrl();
    host = url.startsWith('http') ? url.split('/')[2] : '';
    assertTrue(host.length > 0, url);
  });
}
