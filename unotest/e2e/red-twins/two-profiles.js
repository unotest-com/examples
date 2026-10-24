// Red twin (#608) of newContext({profile}): one directory asked for twice
// in a test is refused, and the message names the directory — a second
// browser on a directory a first one holds would corrupt both.

function test_same_profile_directory_twice_is_refused() {
  step("A first device opens the directory", () => {
    newContext({profile: 'unotest/.runs/two-profiles/twin'});
  });

  step("A second one on the same directory is refused, naming it", () => {
    assert_failed_with(caught_message(() => {
      newContext({profile: 'unotest/.runs/two-profiles/twin'});
    }), 'two-profiles/twin is already open');
  });

  step("Control: another directory opens", () => {
    assertEqual(newContext({profile: 'unotest/.runs/two-profiles/twin-other'}), 2);
  });
}
