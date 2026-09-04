// Database primitives against the sqlite fixture
// (unotest/fixtures/db/dogfood.sqlite, seeded by its seed.mjs).
// The seeded rows are read-only reference data; everything this scenario
// writes is tagged with a run-scoped sku and removed again, so two runs
// never see each other's rows.

function test_db_fixture() {
  step("Reads seeded rows", () => {
    step("Seeded widgets come back through dbQuery", () => {
      rows = dbQuery('SELECT sku, name, qty FROM widgets WHERE status = ? ORDER BY sku', 'active');
      assertTrue(rows.length == 2, 'expected exactly two active widgets in the seed');
      assertTrue(rows[0].sku == 'W-100', 'first active sku should be W-100');
      assertTrue(rows[1].qty == 0, 'W-200 is seeded with qty 0');
    });

    step("Parameters are bound, not interpolated", () => {
      // A value that would break a string-concatenated query.
      rows = dbQuery('SELECT sku FROM widgets WHERE name = ?', "Gasket' OR 1=1 --");
      assertTrue(rows.length == 0, 'a quote in the parameter must not match anything');
    });
  });

  step("Write round trip", () => {
    step("Insert a run-scoped row", () => {
      sku = 'W-' + randomWord(8);
      inserted = dbExec('INSERT INTO widgets (sku, name, qty) VALUES (?, ?, ?)', sku, 'Dogfood widget', 1);
      assertTrue(inserted == 1, 'insert should report one affected row');
    });

    step("Update it and read the new value back", () => {
      updated = dbExec('UPDATE widgets SET qty = ? WHERE sku = ?', 7, sku);
      assertTrue(updated == 1, 'update should report one affected row');
      mine = dbQuery('SELECT qty, name FROM widgets WHERE sku = ?', sku);
      assertTrue(mine.length == 1, 'the row should be findable by its sku');
      assertTrue(mine[0].qty == 7, 'the update did not land');
      assertTrue(textContains(mine[0].name, 'Dogfood'), mine[0].name);
    });

    step("Delete it and confirm it is gone", () => {
      deleted = dbExec('DELETE FROM widgets WHERE sku = ?', sku);
      assertTrue(deleted == 1, 'delete should report one affected row');
      gone = dbQuery('SELECT sku FROM widgets WHERE sku = ?', sku);
      assertTrue(gone.length == 0, 'the row survived the delete');
    });
  });
}
