const FEATURES = [
  {
    tag: "--html",
    tagColor: "var(--color-term-amber)",
    title: "INTERACTIVE GRAPH",
    desc: "Generates a standalone D3 force-directed graph of your entire import boundary — color coded by client, server, boundary, and creep. Click any node for the full why trace in the sidebar.",
    code: "npx client-creep --html",
  },
  {
    tag: "--watch",
    tagColor: "var(--color-action-green)",
    title: "WATCH MODE",
    desc: "Re-runs the full analysis on every file save. See creep appear and disappear in real time as you fix it. 400ms debounce, clears terminal between runs.",
    code: "npx client-creep --watch",
  },
  {
    tag: "GitHub Action",
    tagColor: "#cba6f7",
    title: "CI INTEGRATION",
    desc: "Exit code 1 on creep or budget exceeded. Ships as a native GitHub Action with structured outputs: client-components, boundaries, creep-candidates, estimated-kb.",
    code: "uses: DhruvilChauahan0210/client-creep@main",
  },
  {
    tag: "monorepo",
    tagColor: "#89b4fa",
    title: "MONOREPO READY",
    desc: "Auto-detects pnpm-workspace.yaml, turbo.json, and package.json workspaces. Resolves cross-package imports to their source files. No config needed.",
    code: "npx client-creep ./apps/web",
  },
];

export default function Features() {
  return (
    <section className="features-section">
      <div className="features-inner">
        <div className="features-header">
          <p className="section-label" style={{ color: "#444" }}>/ V0.2 FEATURES /</p>
          <h2 className="section-headline section-headline-inv">
            EVERYTHING<br />YOU NEED.
          </h2>
        </div>
        <div className="features-grid">
          {FEATURES.map(f => (
            <div key={f.tag} className="feature-card">
              <span className="feature-tag" style={{ background: "#1a1a1a", color: f.tagColor }}>
                {f.tag}
              </span>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
              <div className="feature-code-block">
                <code className="feature-code">
                  <span className="feature-code-prompt">$ </span>
                  {f.code}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
