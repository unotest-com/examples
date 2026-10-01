// The extension's background: what a scenario reaches through
// evaluateInServiceWorker. Its API lives at an origin nobody serves, so an
// answer to loadLastMessage can only come from a mockRoute — a fetch the
// worker makes itself (needs a fresh profile, see extension/service-worker).
self.loadLastMessage = (room) =>
  fetch("https://api.unotest.test/room/last-message/load", {
    method: "POST",
    body: JSON.stringify({ room }),
  }).then((r) => r.json());
