export default function CISection() {
  return (
    <section className="ci-section">
      <div className="ci-inner">
        <div className="ci-grid">
          <div>
            <p className="section-label" style={{ color: "#444" }}>/ CI / CD /</p>
            <h2 className="section-headline section-headline-inv">GATE<br />EVERY PR.</h2>
            <div className="ci-flags">
              {[
                { tag: "--ci", desc: "Exit 1 if any accidental creep candidates are found" },
                { tag: "--budget <kb>", desc: "Exit 1 if estimated client JS exceeds your threshold" },
                { tag: "--json", desc: "Pipe structured results into other tools or dashboards" },
              ].map(f => (
                <div key={f.tag} className="ci-flag">
                  <span className="ci-flag-tag">{f.tag}</span>
                  <span className="ci-flag-desc">{f.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ci-codes">
            <div className="ci-code-block">
              <pre className="ci-code">
                <span className="ci-code-comment"># Inline step{"\n"}</span>
                {"- name: Check for client creep\n"
                +"  run: npx client-creep "}
                <span className="ci-code-key">--ci</span>
                {" "}
                <span className="ci-code-key">--budget</span>
                {" "}
                <span className="ci-code-val">500</span>
              </pre>
            </div>
            <div className="ci-code-block">
              <pre className="ci-code">
                <span className="ci-code-comment"># GitHub Action{"\n"}</span>
                {"- "}
                <span className="ci-code-key">uses</span>
                {": DhruvilChauahan0210/client-creep@main\n  "}
                <span className="ci-code-key">with</span>
                {":\n    "}
                <span className="ci-code-key">ci</span>
                {": "}
                <span className="ci-code-val">true</span>
                {"\n    "}
                <span className="ci-code-key">budget</span>
                {": "}
                <span className="ci-code-val">500</span>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
