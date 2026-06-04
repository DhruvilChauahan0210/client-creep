const STEPS = [
  { n: "1", title: "Glob source files", desc: "Scans all .ts/.tsx/.js/.jsx files, respecting .next/, node_modules/, and dist/ ignores. Supports the full App Router directory structure." },
  { n: "2", title: "Parse with Babel AST", desc: "Detects \"use client\" directives and extracts every import. Identifies client signals: hooks, event handlers, browser globals, and known client-only packages." },
  { n: "3", title: "Resolve the import graph", desc: "Maps every import to an absolute path — including tsconfig path aliases (@/*) and monorepo workspace packages across pnpm/turbo/yarn workspaces." },
  { n: "4", title: "Propagate boundaries via BFS", desc: "Starting from every \"use client\" boundary root, breadth-first propagation marks every transitively imported file as part of the client graph." },
  { n: "5", title: "Compute the \"why\" trace", desc: "For each client node, the shortest import path back to the boundary that dragged it in. This is the signature feature — the one no other tool gives you." },
  { n: "6", title: "Flag creep and estimate cost", desc: "Files with no detected client signals are flagged as candidates. Sizes are estimated from raw source bytes, ranked by most recoverable KB first." },
];

export default function HowItWorks() {
  return (
    <section className="hiw-section">
      <div className="hiw-inner">
        <div className="hiw-grid">
          <div className="hiw-sticky">
            <p className="section-label">/ HOW IT WORKS /</p>
            <h2 className="section-headline">PURE<br />STATIC<br />ANALYSIS.</h2>
            <p className="hiw-sticky-sub">
              No app running. No runtime dependency. No React version requirement.
              Just reads your source files.
            </p>
            <a
              href="https://github.com/DhruvilChauahan0210/client-creep"
              target="_blank"
              rel="noopener"
              className="oss-badge"
              style={{ marginTop: "24px" }}
            >
              ★ Free &amp; Open Source · MIT
            </a>
          </div>
          <div className="hiw-steps">
            {STEPS.map(step => (
              <div key={step.n} className="hiw-step">
                <div className="hiw-step-num">{step.n}</div>
                <div>
                  <div className="hiw-step-title">{step.title}</div>
                  <p className="hiw-step-desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
