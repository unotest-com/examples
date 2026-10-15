// The message of the error a call throws, '' when it does not throw. For a
// step that proves an option by the failure it causes without the option.
function caught_message(fn) {
  let message = '';
  try {
    fn();
  } catch (e) {
    message = e.message;
  }
  return message;
}

// A red twin's (#449) verdict on the message caught_message returned: the
// check failed, and its message names the subject — the function, or what
// only the option under test makes it say.
function assert_failed_with(message, subject) {
  assertTrue(message.includes(subject), 'expected a failure naming ' + subject + ', got: ' + (message || 'no failure'));
}

// timeoutMs proves itself by when the failure comes: before the suite's
// 3 s default, which a wait cannot beat however idle the machine. The bound
// sits under it, not near the twins' own small timeouts — a release dry-run
// builds and runs four workers at once and adds a second to a step. The twin's call stays inside caught_message(() => …)
// itself — that is where the coverage guard looks for it.
function assert_failed_in_time(started, subject) {
  const took = nowMs() - started;
  assertTrue(took < 2500, subject + ' failed after ' + took + ' ms, its timeoutMs is not honoured');
}
