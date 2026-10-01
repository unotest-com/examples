// Acceptance #292 on the pilot's constants: unotest/fixtures/accept-045/
// shared.json is what demo-kit's export script writes from
// src/shared/{chat-labels,chat-state-text,devices}.ts — Cyrillic texts,
// keys with dashes, a list of objects. The scenario types them into a real
// field and reads them back, so a lost byte or a wrong key fails here.

function test_read_json_pilot_constants() {
  step("Read the pilot's constants", () => {
    shared = readJson('unotest/fixtures/accept-045/shared.json');
    assertTrue(shared.state['preset-not-found'] == 'для этого сайта пресета нет', json(shared.state));
    assertTrue(shared.devices[0].frame.width == 440, json(shared.devices[0]));
  });

  step("A constant goes into a field unchanged", () => {
    goto('/login');
    fill(getByLabel('Username'), shared.labels.quiet);
    assertValue(getByLabel('Username'), shared.labels.quiet);
    assertValue(getByLabel('Username'), 'В чате пока тихо');
  });
}
