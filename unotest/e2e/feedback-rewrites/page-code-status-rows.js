// Rewrite of unopipe _helpers/status_rows.js (2026-10-09 item 2, #379):
// the chat list read in page code. The suite passed that code as a
// template string, so the regex escape \/ inside it became / once
// templates read as JavaScript (R1) and closed the literal. As a function
// it is page code the scenario does not parse as a string: no escaping,
// and the agents travel as an argument.

function own_status_rows(agents) {
  return evaluateOnLocator(locator('body'), (body, names) => { // lint-ok: the client's page-code read, kept as a function
    const rows = [...body.querySelectorAll('li')].filter((row) => !row.textContent.includes('⇄'));
    const nameOf = (row) => row.querySelector('b')?.textContent.trim();
    return names.map((agent) => {
      const row = rows.find((candidate) => nameOf(candidate) === agent && /^[a-z0-9-]{3,}(\/[a-z0-9-]+)?$/.test(agent));
      if (!row) return null;
      const line = row.querySelector('[data-status]');
      return { agent, status: line ? line.getAttribute('data-status') : null };
    });
  }, agents);
}

function test_status_rows_in_page_code() {
  step("Read the agents' status lines in page code", () => {
    goto("data:text/html;charset=utf-8,<ul><li><b>ann/helper</b><i data-status='online'>online</i></li><li><b>bob</b></li><li><b>ann ⇄ bob</b><i data-status='busy'>busy</i></li><li><b>cyd</b><i data-status='stale'>stale</i></li></ul>");
    assertEqual(own_status_rows(['ann/helper', 'cyd', 'bob', 'nobody']), [
      { agent: 'ann/helper', status: 'online' },
      { agent: 'cyd', status: 'stale' },
      { agent: 'bob', status: null },
      null,
    ]);
  });
}
