// The resource walls around a run: how many processes it may have, and
// whether the one writable directory can also execute. Like
// sandbox/isolation-probe this scenario reports rather than asserts — a
// wall that is not there is exactly the answer worth reading — and stays
// GREEN. It lives in the `isolation` collection only: on a box before
// isolation the fork burst below runs as a child of boxd itself.
//
// The burst is bounded on purpose: a classic fork bomb would keep the
// container saturated and starve the scenario's own reporting. Here 600
// `sleep` children are spawned from node, which reports a refused fork
// (EAGAIN) per child instead of dying with the shell; the cgroup counters
// are the answer, and every child is killed before the next probe.

function test_isolation_limits_report_pids_and_tmp_exec() {
  step("Process budget: a bounded fork burst", () => {
    probe_note('pids-limit-cgroup', shell('sh', '-c', 'cat /sys/fs/cgroup/pids.max 2>/dev/null || cat /sys/fs/cgroup/pids/pids.max 2>/dev/null || echo unknown', {allowNonZero: true}));
    // 600 `sleep` children against a budget of 512 pids, spawned from node
    // rather than a shell: dash exits on the first failed fork and bash
    // retries for minutes, while node's spawn reports EAGAIN per child and
    // carries on. The cgroup files say how many pids are live and how often
    // the limit bit; every child is killed before the next probe.
    probe_note('fork-burst', shell('node', '-e', `
      const { spawn } = require("node:child_process");
      const { readFileSync } = require("node:fs");
      const cg = (f) => { try { return readFileSync("/sys/fs/cgroup/" + f, "utf8").trim().replace(/\s+/g, " "); } catch { return "unknown"; } };
      const kids = []; let ok = 0, failed = 0, firstErr = "";
      const one = () => new Promise((res) => {
        const c = spawn("sleep", ["60"], { stdio: "ignore" });
        c.once("spawn", () => { ok++; kids.push(c); res(); });
        c.once("error", (e) => { failed++; if (!firstErr) firstErr = e.code || String(e); res(); });
      });
      (async () => {
        for (let i = 0; i < 600; i++) await one();
        const current = cg("pids.current"), events = cg("pids.events");
        for (const c of kids) c.kill("SIGTERM");
        await new Promise((r) => setTimeout(r, 500));
        console.log("attempted=600 spawned=" + ok + " refused=" + failed + " first-error=" + (firstErr || "-") + " pids.current=" + current + " pids.events=" + events + " after-kill=" + cg("pids.current"));
      })();
    `, {allowNonZero: true, timeoutMs: 60000}));
    probe_note('still-alive', shell('echo', 'the scenario still runs after the burst', {allowNonZero: true}));
  });

  step("Executing from the writable directory", () => {
    probe_note('tmp-exec', shell('sh', '-c', 'cp /bin/true /tmp/.isolation-true && chmod +x /tmp/.isolation-true && /tmp/.isolation-true && echo executed; rm -f /tmp/.isolation-true', {allowNonZero: true}));
    probe_note('tmp-mount', shell('sh', '-c', 'grep " /tmp " /proc/mounts', {allowNonZero: true}));
    probe_note('memory-limit-cgroup', shell('sh', '-c', 'cat /sys/fs/cgroup/memory.max 2>/dev/null || cat /sys/fs/cgroup/memory/memory.limit_in_bytes 2>/dev/null || echo unknown', {allowNonZero: true}));
  });
}
