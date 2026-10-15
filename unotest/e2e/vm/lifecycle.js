// #452: a Tart VM driven from the scenario. The image is `clean-linux`, a
// ready Ubuntu VM on the host (tart clone ghcr.io/cirruslabs/ubuntu:latest
// clean-linux); a host without Tart skips the test. A name the test did
// not clone is refused as a script error, not a failed check, so it has
// no @expect-fail twin here: unit tests hold it, with its control.

function test_vm_from_clone_to_delete() {
  skip('no tart on this host', !vmAvailable());

  step("Clone the image and boot it", () => {
    const vm = vmClone('clean-linux');
    assertTrue(textMatches(vm, /^unotest-[0-9a-f]{8}-1$/) !== false, vm);
    const ip = vmRun(vm);
    assertTrue(textMatches(ip, /^\d+\.\d+\.\d+\.\d+$/) !== false, ip);
    assertEqual(vmIp(vm), ip);
    vmStop(vm);
    vmDelete(vm);
  });

  step("A VM left running is removed when the test ends", () => {
    const left = vmClone('clean-linux');
    assertTrue(textMatches(left, /-2$/) !== false, left);
    vmRun(left);
  });
}
