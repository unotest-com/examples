// Red twins (#449) of the VM steps' timeoutMs, on a Tart clone of
// `clean-linux` (as vm/lifecycle); a host without Tart skips. Tart waits
// in whole seconds: a 1 s budget must fail with Tart asked to wait 1 s,
// within a few seconds — far from the 60 s and 180 s defaults. The same
// VM answers vmIp without the budget once it is up. Clones are deleted
// when the test ends.

function assert_failed_well_before_default(started, subject) {
  const took = nowMs() - started;
  assertTrue(took < 10000, subject + ' failed after ' + took + ' ms, its timeoutMs is not honoured');
}

function test_vm_timeout_twins() {
  skip('no tart on this host', !vmAvailable());
  let vm;

  step("vmRun timeoutMs: a guest that cannot boot in a second fails in time", () => {
    vm = vmClone('clean-linux');
    const started = nowMs();
    assert_failed_with(caught_message(() => vmRun(vm, {timeoutMs: 1000})), '--wait 1 failed');
    assert_failed_well_before_default(started, 'vmRun');
  });

  step("vmIp timeoutMs: the guest still booting has no address in time, booted it has", () => {
    const started = nowMs();
    assert_failed_with(caught_message(() => vmIp(vm, {timeoutMs: 1000})), '--wait 1 failed');
    assert_failed_well_before_default(started, 'vmIp');
    assertTrue(textMatches(vmIp(vm), /^\d+\.\d+\.\d+\.\d+$/) !== false, 'no address once booted');
  });
}
