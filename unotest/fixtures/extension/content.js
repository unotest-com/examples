// The whole extension: one node the page itself never renders. A scenario
// that sees it knows the browser was started with this extension loaded;
// the same scenario without `launch` must not (expect-fail/extension-absent).
const marker = document.createElement("div");
marker.dataset.testid = "unotest-extension-marker";
marker.textContent = "unotest extension fixture loaded";
document.body.appendChild(marker);
