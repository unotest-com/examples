// Idiom: run code in the page with a value from the test.
// Habit: evaluate("document.title = '" + name + "'"): the value becomes
// page code, and the validator refuses it (validator:evaluate-interpolation).
// Typed form: a function literal plus arguments, evaluate(fn, value). The
// function sees only its parameters. Prefer a typed getter when one exists.

function test_idiom_page_code_function() {
  step("Open a blank page", () => {
    goto('data:text/html,<title>start</title><p>ready</p>');
    waitForText('ready');
  });

  step("Pass the value as an argument, not inside the code", () => {
    let name = 'Quarterly report';
    evaluate((title) => { document.title = title; }, name); // lint-ok: the idiom is page code done right
    assertEqual(getTitle(), 'Quarterly report');
  });
}
