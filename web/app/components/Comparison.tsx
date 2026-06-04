const ROWS = [
  { label: "Open Source", us: "✓ MIT", them1: "✓ MIT", them2: "✓ MIT" },
  { label: "How to use", us: "npx — one shot, zero setup", them1: "Add provider + run app", them2: "npx" },
  { label: "Next.js versions", us: "13 / 14 / 15 / 16", them1: "16+ only ⚠", them2: "any" },
  { label: "Where is the boundary?", us: "✓", them1: "✓ live overlay", them2: "✗" },
  { label: "Why is this client?", us: "✓ full import trace", them1: "✗", them2: "✗" },
  { label: "Did it need to be?", us: "✓ creep detection", them1: "✗", them2: "partial" },
  { label: "What does it cost?", us: "✓ estimated KB", them1: "✗", them2: "✗" },
  { label: "Interactive graph", us: "✓ --html D3", them1: "✗", them2: "✗" },
  { label: "Watch mode", us: "✓ --watch", them1: "✗", them2: "✗" },
  { label: "CI / exit codes", us: "✓ --ci + --budget", them1: "✗", them2: "weak" },
  { label: "Monorepo support", us: "✓ pnpm / turbo / yarn", them1: "✗", them2: "✗" },
  { label: "Needs running app", us: "✗ (never)", them1: "✓ required", them2: "✗" },
];

export default function Comparison() {
  return (
    <section className="comparison-section">
      <div className="comparison-inner">
        <div className="comparison-header">
          <p className="section-label">/ VS. THE ALTERNATIVES /</p>
          <h2 className="section-headline">
            ONE STEP FURTHER<br />ON EVERY AXIS.
          </h2>
        </div>
        <div className="comparison-table-wrap">
          <table className="comparison-table">
            <thead>
              <tr>
                <th className="comparison-th-other" style={{ textAlign: "left", paddingLeft: 0 }} />
                <th className="comparison-th-us">
                  <div className="comparison-th-us-inner">⚡ client-creep</div>
                </th>
                <th className="comparison-th-other">rsc-boundary</th>
                <th className="comparison-th-other">next-component-analyzer</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(row => (
                <tr key={row.label}>
                  <td className="comparison-td-label">{row.label}</td>
                  <td className="comparison-td-us">{row.us}</td>
                  <td className="comparison-td-other">{row.them1}</td>
                  <td className="comparison-td-other">{row.them2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="comparison-note">
          rsc-boundary has a beautiful live overlay — if you&apos;re on Next 16 and want to see boundaries paint on your running page, it&apos;s great.
          client-creep answers the questions rsc-boundary can&apos;t: the <em>why</em>, the <em>did it need to be</em>, and the <em>cost</em> — on any Next version, without running anything.
        </p>
      </div>
    </section>
  );
}
