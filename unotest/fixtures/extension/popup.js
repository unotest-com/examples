// MV3 pages run no inline script, hence a file: show what the worker stored.
chrome.storage.local.get("theme").then(({ theme }) => {
  document.querySelector("[data-testid=popup-theme]").textContent = theme ?? "unset";
});
