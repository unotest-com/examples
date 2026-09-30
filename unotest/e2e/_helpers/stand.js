// A "stand" setting a test turns on and must give back: here a flag in the
// page's localStorage. The flow carries its own rollback — it registers the
// teardown BEFORE it changes anything, so even a failure half way through
// turning the flag on is rolled back.
function flow_set_stand_flag(key) {
  teardown("Turn the stand flag off", () => {
    setLocalStorage(key, 'off');
    log('stand flag off', key);
  });
  setLocalStorage(key, 'on');
}
