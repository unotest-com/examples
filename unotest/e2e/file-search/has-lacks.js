// assertFileHas / assertFileLacks (#508): the plaintext check every
// encryption acceptance ends with. A background writer leaves a small tree
// behind — a log with the ciphertext, a nested dump, a binary blob — and
// the scenario proves what is there and what is not, in the report.
// Files land under the suite's scratch directory with a run-scoped marker.

function test_file_search_has_and_lacks() {
  let dir;
  step("A writer leaves a log tree behind", () => {
    const marker = randomWord(10);
    dir = scratch_path('search-' + marker);
    shell('node', '-e', 'const fs=require("node:fs"),p=require("node:path");const d=process.argv[1];fs.mkdirSync(p.join(d,"db"),{recursive:true});fs.writeFileSync(p.join(d,"app.log"),"boot\\nstored token as v1:QUJDREVGR0hJSktMTU5PUA==\\n");fs.writeFileSync(p.join(d,"db","dump.sql"),"insert into t values (1, \'v1:QUJDREVGR0hJSktMTU5PUA==\');\\n");fs.writeFileSync(p.join(d,"db","blob.bin"),Buffer.from([0,1,2,255,77,65,82,75,0]));', dir, {timeoutMs: 5000});
  });

  step("The ciphertext is there, in the log and deep in the dump", () => {
    assertFileHas(dir, /v1:[A-Za-z0-9+\/=]{20,}/);
    assertFileHas(dir + '/db/dump.sql', 'v1:QUJDREVGR0hJSktMTU5PUA==', {timeoutMs: 2000});
  });

  step("A string is searched as bytes, inside a binary file too", () => {
    assertFileHas(dir + '/db', 'MARK');
  });

  step("The plaintext is nowhere in the tree", () => {
    assertFileLacks(dir, 'plaintext-token-value');
    assertFileLacks(dir, /sk-live-[0-9a-f]{24}/, {withinMs: 300});
  });
}
