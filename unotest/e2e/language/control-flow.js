// switch, while, do…while, for…in, break and continue (#440). The
// statuses come from the page, so each branch is taken on a value the
// browser produced.

function label_of(status) {
  switch (status) {
    case 'new':
    case 'open':
      return 'active';
    case 'done':
      return 'closed';
    default:
      return 'unknown:' + status;
  }
}

function test_control_flow() {
  step("switch with fall-through and default on page values", () => {
    goto("data:text/html,<ul><li>new</li><li>open</li><li>done</li><li>lost</li></ul>");
    const items = getByRole('listitem');
    const statuses = [];
    for (let i = 0; i < count(items); i++) {
      statuses.push(getInnerText(items.nth(i)));
    }
    assertEqual(statuses.map(label_of), ['active', 'active', 'closed', 'unknown:lost']);
    let hits = 0;
    switch (statuses.length) {
      case 4:
        hits += 1;
      case 5:
        hits += 10;
        break;
      case 6:
        hits += 100;
    }
    assertEqual(hits, 11);
  });

  step("while and do…while with break and continue", () => {
    let i = 0;
    const odd = [];
    while (true) {
      i++;
      if (i > 7) break;
      if (i % 2 === 0) continue;
      odd.push(i);
    }
    assertEqual(odd, [1, 3, 5, 7]);
    let runs = 0;
    do {
      runs++;
    } while (runs < 0);
    assertEqual(runs, 1);
  });

  step("for…in walks own keys, for with continue", () => {
    const keys = [];
    for (const k in { b: 2, a: 1 }) {
      keys.push(k);
    }
    assertEqual(keys, ['b', 'a']);
    let total = 0;
    for (let n = 0; n < 5; n++) {
      if (n === 2) continue;
      total += n;
    }
    assertEqual(total, 8);
  });
}
