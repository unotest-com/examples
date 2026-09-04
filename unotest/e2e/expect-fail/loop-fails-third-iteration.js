// @expect-fail
// A loop that SKIPS its second iteration and FAILS on the third. The DSL
// has no `continue` (dsl-reference: not supported), so the skip is an
// `if` around the body — which is what the trace has to show:
// iteration 1 with steps, iteration 2 with none, iteration 3 failing, no
// iteration 4. The tag makes each iteration findable in the tree.

function test_loop_fails_on_the_third_iteration() {
  step("Iterate over four ids, skipping the second", () => {
    goto('/scenarios/clicks');
    waitFor(getByRole('button', {name: 'Click me', exact: true}));
    ids = ['one', 'two', 'three', 'four'];
    for (i = 0; i < 4; i = i + 1) {
      id = ids[i];
      if (id != 'two') {
        step("Iteration", {tag: id}, () => {
          assertVisible(getByRole('button', {name: 'Click me', exact: true}));
          if (id == 'three') {
            assertText(getByRole('button', {name: 'Click me', exact: true}), 'Never this label', {timeout: 800});
          }
        });
      }
    }
  });

  step("Never reached", () => {
    log('the loop must not get here');
  });
}
