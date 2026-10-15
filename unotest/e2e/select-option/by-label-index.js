// selectOption by the option's visible text {label} and its position
// {index}, next to the value forms — the typed way instead of reading an
// option's value by its text through evaluateOnLocator. An inline page
// (a data: URL) holds one <select> whose values differ from its labels.

function folders_page_url() {
  return 'data:text/html,<label>Folder <select data-testid="folder">' +
    '<option value="f-1">Inbox</option>' +
    '<option value="f-2">Archive</option>' +
    '<option value="f-3">Sent mail</option>' +
    '</select></label>';
}

function test_select_option_by_label_and_index() {
  step("Open a page with a folder picker", () => {
    goto(folders_page_url());
    waitFor(getByTestId('folder'));
  });

  step("Pick by label and by index", () => {
    selectOption(getByTestId('folder'), {label: 'Sent mail'});
    assertValue(getByTestId('folder'), 'f-3');
    selectOption(getByTestId('folder'), {index: 1});
    assertValue(getByTestId('folder'), 'f-2');
  });

  step("The value forms work as before", () => {
    selectOption(getByTestId('folder'), 'f-1');
    assertValue(getByTestId('folder'), 'f-1');
    selectOption(getByTestId('folder'), {value: 'f-3'});
    assertValue(getByTestId('folder'), 'f-3');
  });

  step("A label no option has names the labels there are", () => {
    let caught = '';
    try {
      selectOption(getByTestId('folder'), {label: 'Drafts'}, {timeout: 500});
    } catch (e) {
      caught = e.message;
    }
    assertTrue(textContains(caught, 'labels: "Inbox", "Archive", "Sent mail"'), caught);
  });
}
