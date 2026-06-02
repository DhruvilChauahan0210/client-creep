const CARDS = [
  {
    num: "01",
    q: "WHY IS THIS CLIENT?",
    body: "You added \"use client\" to one file months ago. Now half your import tree is client and you have no idea which import dragged it there. The boundary spreads silently.",
    answer: "client-creep traces the full import chain from every boundary root to every affected file.",
    answerColor: "var(--color-term-amber)",
  },
  {
    num: "02",
    q: "DID IT NEED TO BE?",
    body: "Tons of components are client by accident — pulled in by a parent, zero hooks, zero browser APIs. Each one ships unnecessary JS that slows your users down.",
    answer: "client-creep flags every component with no client signals as a candidate to hoist back to server.",
    answerColor: "var(--color-action-green)",
  },
  {
    num: "03",
    q: "WHAT DOES IT COST?",
    body: "Every client component and its entire import subtree lands in the browser bundle. Nobody can see the cost of a given boundary without running a full bundle analysis.",
    answer: "client-creep estimates client JS per boundary, total size, and recoverable bytes — one command.",
    answerColor: "var(--color-alert-yellow)",
  },
];

export default function Problem() {
  return (
    <section className="problem-section">
      <div className="problem-inner">
        <div className="problem-header">
          <p className="section-label">/ THE PROBLEM /</p>
          <h2 className="section-headline">
            THREE QUESTIONS.<br />
            NO EXISTING TOOL<br />
            ANSWERS ALL THREE.
          </h2>
        </div>
        <div className="problem-cards">
          {CARDS.map(card => (
            <div key={card.num} className="problem-card">
              <span className="problem-card-num">{card.num}</span>
              <h3 className="problem-card-q">{card.q}</h3>
              <p className="problem-card-body">{card.body}</p>
              <div className="problem-card-divider" />
              <p className="problem-card-answer" style={{ color: card.answerColor }}>
                {card.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
