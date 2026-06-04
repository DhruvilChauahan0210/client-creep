const ITEMS = [
  "1,073 CLIENT COMPONENTS",
  "643 KB RECOVERABLE",
  "269 CREEP CANDIDATES",
  "NEXT.JS 13 → 16",
  "ZERO CONFIG",
  "FREE & OPEN SOURCE",
  "STATIC ANALYSIS",
  "IMPORT GRAPH TRACE",
  "CI READY",
  "MIT LICENSE",
];

export default function Marquee() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div className="marquee-wrap">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className="marquee-item">
            {item}
            <span className="marquee-dot"> · </span>
          </span>
        ))}
      </div>
    </div>
  );
}
