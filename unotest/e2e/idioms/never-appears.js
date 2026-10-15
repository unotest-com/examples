// Idiom: something must NOT appear.
// Habit: pause(3000), then assertHidden(banner). A banner that came and
// went inside the pause passes unseen.
// Typed step: assertNeverAppears(locator, {withinMs}) watches the whole
// window and fails the moment the element shows.

function quiet_page_url() {
  return 'data:text/html,<p>Saved.</p><div data-testid="error" hidden>Sync failed</div>';
}

function test_idiom_never_appears() {
  step("Open a page that stays quiet", () => {
    goto(quiet_page_url());
    waitForText('Saved.');
  });

  step("No error banner during the whole window", () => {
    assertNeverAppears(getByText('Sync failed'), {withinMs: 2000});
  });
}
