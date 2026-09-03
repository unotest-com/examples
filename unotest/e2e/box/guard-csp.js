// id-box/guard-csp
// Guard: CSP nonce on pages, no-store on secret reveals
// #4287f5
//
// HTTP-level checks the browser cannot express: the guard's response
// headers. A small node script logs in over fetch (cookie jar by hand),
// fetches a page and a reveal endpoint, and prints what it saw as JSON.
function test_guard_csp() {
  step("Probe the guard over HTTP", () => {
    probe = shell("node", "-e", `
      const [base, user, pass] = process.argv.slice(1);
      const out = {};
      const cookies = new Map();
      const jar = () => [...cookies].map(([k, v]) => k + "=" + v).join("; ");
      const keep = (res) => {
        for (const c of res.headers.getSetCookie?.() ?? []) {
          const [pair] = c.split(";"); const i = pair.indexOf("=");
          cookies.set(pair.slice(0, i), pair.slice(i + 1));
        }
      };
      const get = async (path, extra = {}) => {
        const res = await fetch(base + path, { redirect: "manual", headers: { cookie: jar(), ...extra } });
        keep(res); return res;
      };
      (async () => {
        const login = await get("/_guard/login");
        const state = new URL(login.headers.get("location"), base).searchParams.get("state");
        const page = await get("/_guard/login/password?state=" + state);
        const html = await page.text();
        out.pageCsp = page.headers.get("content-security-policy") || "";
        const nonce = (out.pageCsp.match(/script-src 'nonce-([^']+)'/) || [])[1] || "";
        out.scriptNonceMatches = nonce !== "" && html.includes('nonce="' + nonce + '"');
        out.frameAncestors = /frame-ancestors 'none'/.test(out.pageCsp);
        const cb = await fetch(base + "/_guard/login/callback", { method: "POST", redirect: "manual",
          headers: { "content-type": "application/x-www-form-urlencoded", cookie: jar() },
          body: new URLSearchParams({ state, username: user, password: pass }) });
        keep(cb);
        const reveal = await get("/_guard/admin/env/dogfood/prod/secrets/BOX_LAB_PASSWORD?how=show",
          { origin: base, accept: "application/json", "x-unotest-guard": "1" });
        out.revealStatus = reveal.status;
        out.revealCacheControl = reveal.headers.get("cache-control") || "";
        const all = await get("/_guard/admin/env/dogfood/prod/secrets?how=show",
          { origin: base, accept: "application/json", "x-unotest-guard": "1" });
        out.revealAllStatus = all.status;
        out.revealAllCacheControl = all.headers.get("cache-control") || "";
        await fetch(base + "/_guard/logout", { method: "POST", redirect: "manual", headers: { cookie: jar() } });
        console.log(JSON.stringify(out));
      })().catch((e) => { console.error(e); process.exit(1); });
    `, APP_BASE_URL, "ivan", BOX_LAB_PASSWORD);
    report = probe.stdout;
  });
  step("Pages carry a nonce CSP", () => {
    assertTrue(textContains(report, "\"scriptNonceMatches\":true"), report);
    assertTrue(textContains(report, "\"frameAncestors\":true"), report);
  });
  step("Reveal answers are not cacheable", () => {
    assertTrue(textContains(report, "\"revealStatus\":200"), report);
    assertTrue(textContains(report, "\"revealCacheControl\":\"no-store\""), report);
    assertTrue(textContains(report, "\"revealAllStatus\":200"), report);
    assertTrue(textContains(report, "\"revealAllCacheControl\":\"no-store\""), report);
  });
}
