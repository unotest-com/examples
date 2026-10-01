// @expect-fail
// Deliberate failure: assertEqual on two objects that differ in one
// nested field must name that field's path and both values, not only
// say "not equal".

function test_assert_equal_names_the_path() {
  step("Compare settings that differ in one nested field", () => {
    goto('/');
    waitForText('Stress-test browser');
    actual = parseJson('{"theme":"dark","panel":{"devices":["pixel","iphone"]}}');
    assertEqual(actual, {theme: 'dark', panel: {devices: ['pixel', 'ipad']}});
  });
}
