// JSONL oracles (bot-service round 4): a background process appends
// structured events to a file and the scenario waits on them by KEY, not
// by substring — JSON key order is not guaranteed, so a substring filter
// breaks the first time the writer reorders its fields. Files land under
// unotest/.tmp/ with a run-scoped marker so parallel runs never collide.

function test_json_line_oracles() {
  step("A background writer appends two events plus noise", () => {
    marker = randomWord(10);
    path = 'unotest/.tmp/' + marker + '.jsonl';
    // Keys are deliberately emitted in a different order per line, and a
    // half-written trailing line stands in for a file caught mid-append.
    shell('node', '-e', 'const {mkdirSync,appendFileSync}=require("node:fs");const p=process.argv[1];mkdirSync("unotest/.tmp",{recursive:true});appendFileSync(p,JSON.stringify({roomId:"r1",userId:"human",isBot:false})+"\\n");setTimeout(()=>appendFileSync(p,JSON.stringify({isBot:true,userId:"bot_x",roomId:"r1",seq:1})+"\\n"),200);setTimeout(()=>appendFileSync(p,JSON.stringify({isBot:true,userId:"bot_x",roomId:"r1",seq:2})+"\\n{\\"isBot\\":tr"),500);', path, {timeoutMs: 5000});
  });

  step("waitForJsonLine matches by keys and hands the line back parsed", () => {
    evt = waitForJsonLine(path, {userId: 'bot_x', roomId: 'r1', isBot: true}, {timeoutMs: 8000});
    assertTrue(evt.seq == 1, 'the first bot event should win');
  });

  step("waitForFileCount waits for the SECOND event", () => {
    seen = waitForFileCount(path, {userId: 'bot_x'}, 2, {timeoutMs: 8000});
    assertTrue(seen == 2, 'exactly the two bot lines should be counted');
  });

  step("assertFileCount pins the exact number of human lines", () => {
    assertFileCount(path, {userId: 'human'}, 1);
  });

  step("assertNoJsonLine proves an event that must not exist", () => {
    assertNoJsonLine(path, {userId: 'nobody'}, {withinMs: 600});
  });

  step("Clean up after the run", () => {
    shell('node', '-e', 'require("node:fs").rmSync(process.argv[1], {force: true})', path);
    assertNoFile(path, {withinMs: 300});
  });
}
