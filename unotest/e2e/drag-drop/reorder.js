// Kanban board with two drag implementations. dragAndDrop() dispatches
// synthetic mouse events, which is what the Pointer mode listens to — the
// HTML5 DnD mode needs native DragEvents no automation tool produces, and
// that is the trap this page exists for.

function test_pointer_drag_moves_a_card() {
  step("Open the board in pointer mode", () => {
    goto('/scenarios/drag-drop');
    click(getByRole('button', {name: 'Pointer'}));
    waitFor(getByRole('region', {name: 'Column: Backlog'}));
  });

  step("The card starts in Backlog", () => {
    assertVisible(getByRole('region', {name: 'Column: Backlog'})
      .getByRole('article', {name: 'Plan Q3 OKRs'}));
  });

  step("Hover the handle, then drag the card into Review", () => {
    handle = getByRole('button', {name: 'Drag handle for Plan Q3 OKRs'});
    hover(handle);
    dragAndDrop(handle, getByRole('region', {name: 'Column: Review'}));
  });

  step("The board reports the move and the card lives in Review", () => {
    waitForText("Moved 'Plan Q3 OKRs'");
    assertVisible(getByRole('region', {name: 'Column: Review'})
      .getByRole('article', {name: 'Plan Q3 OKRs'}));
    assertHidden(getByRole('region', {name: 'Column: Backlog'})
      .getByRole('article', {name: 'Plan Q3 OKRs'}));
  });

  step("Reset puts the board back", () => {
    click(getByRole('button', {name: 'Reset board'}));
    assertVisible(getByRole('region', {name: 'Column: Backlog'})
      .getByRole('article', {name: 'Plan Q3 OKRs'}));
  });
}
