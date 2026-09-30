// A page that lives on timers: a counter and a "typing" indicator tick
// every 100 ms, and the page prints what Date says. Inline (a data: URL),
// because the clock only matters on a page whose every timer this suite
// knows — a live site would add timers of its own.
function clock_page_url() {
  return 'data:text/html,<style>body{font:40px sans-serif;margin:40px}</style>' +
    '<div data-testid="count">0</div>' +
    '<div data-testid="typing">typing</div>' +
    '<div data-testid="now"></div>' +
    '<script>let n = 0; setInterval(() => { n++;' +
    ' document.querySelector("[data-testid=count]").textContent = String(n);' +
    ' document.querySelector("[data-testid=typing]").textContent = "typing" + ".".repeat(n % 4);' +
    ' document.querySelector("[data-testid=now]").textContent = new Date().toISOString();' +
    ' }, 100);</script>';
}
