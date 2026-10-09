// Stands in for an application's own source: the constants its UI is
// built from. A suite never imports app code — it would not be there on a
// box — so `generate` turns this into JSON inside the suite before a run.
export const hub = {
  title: "Stress-test browser",
  pages: [
    { id: "clicks", path: "/scenarios/clicks", marker: "Click me" },
    { id: "drag-drop", path: "/scenarios/drag-drop", marker: "Backlog" },
  ],
};
