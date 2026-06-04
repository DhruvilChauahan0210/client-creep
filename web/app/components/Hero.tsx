"use client";
import { useEffect, useState } from "react";

/* Two columns of terminal output rendered side by side */
const COL_A: { t: string; c?: string; bold?: boolean; ms: number }[] = [
  { t: "  Scanning…",                                                          c: "#555",    ms: 0    },
  { t: "────────────────────────────────────────────────",                     c: "#1a1a1a", ms: 220  },
  { t: "  client-creep  ·  Next.js analysis", bold: true,                     c: "#cdd6f4", ms: 310  },
  { t: "────────────────────────────────────────────────",                     c: "#1a1a1a", ms: 390  },
  { t: "",                                                                                   ms: 460  },
  { t: "  Files scanned:           3,116",                                    c: "#3a3a4a", ms: 560  },
  { t: "  Client components:       1,073  (593 boundaries)", bold: true,      c: "#f9e2af", ms: 720  },
  { t: "  Estimated client JS:     5.44 MB",                                  c: "#f9e2af", ms: 870  },
  { t: "  Potentially recoverable: 643 KB  (269 candidates)", bold: true,     c: "#a6e3a1", ms: 1020 },
  { t: "",                                                                                   ms: 1160 },
  { t: "────────────────────────────────────────────────",                     c: "#1a1a1a", ms: 1240 },
  { t: "  Accidental Client Creep", bold: true,                               c: "#f38ba8", ms: 1320 },
  { t: "────────────────────────────────────────────────",                     c: "#1a1a1a", ms: 1400 },
  { t: "",                                                                                   ms: 1460 },
  { t: "  ! lib/zod/schemas/partners.ts  30.1 KB",                           c: "#f38ba8", ms: 1540 },
  { t: "    No client-only signals detected",                                  c: "#585b70", ms: 1630 },
  { t: "    Why client:",                                                      c: "#585b70", ms: 1700 },
  { t: "    * lib/swr/use-commission.ts  <- use client",                     c: "#f9e2af", ms: 1780 },
  { t: "      |_ lib/types.ts",                                               c: "#585b70", ms: 1860 },
  { t: "           |_ lib/zod/schemas/partners.ts",                          c: "#585b70", ms: 1930 },
];

const COL_B: { t: string; c?: string; bold?: boolean; ms: number }[] = [
  { t: "",                                                                                   ms: 1460 },
  { t: "  ! ui/analytics/charts/BarChart.tsx  18.4 KB",                     c: "#f38ba8", ms: 1540 },
  { t: "    No client-only signals detected",                                  c: "#585b70", ms: 1630 },
  { t: "    Why client:",                                                      c: "#585b70", ms: 1700 },
  { t: "    * app/analytics/page.tsx  <- use client",                        c: "#f9e2af", ms: 1780 },
  { t: "      |_ ui/analytics/charts/BarChart.tsx",                         c: "#585b70", ms: 1860 },
  { t: "",                                                                                   ms: 1940 },
  { t: "  ! components/ui/accordion.tsx  4.2 KB",                           c: "#f38ba8", ms: 2020 },
  { t: "    No client-only signals detected",                                  c: "#585b70", ms: 2100 },
  { t: "    Why client:",                                                      c: "#585b70", ms: 2160 },
  { t: "    * components/providers.tsx  <- use client",                      c: "#f9e2af", ms: 2240 },
  { t: "      |_ components/ui/accordion.tsx",                               c: "#585b70", ms: 2320 },
  { t: "",                                                                                   ms: 2400 },
  { t: "  ! lib/utils/format.ts  3.8 KB",                                    c: "#f38ba8", ms: 2480 },
  { t: "    No client-only signals detected",                                  c: "#585b70", ms: 2560 },
  { t: "    Why client:",                                                      c: "#585b70", ms: 2620 },
  { t: "    * app/dashboard/page.tsx  <- use client",                        c: "#f9e2af", ms: 2700 },
  { t: "      |_ lib/utils/format.ts",                                       c: "#585b70", ms: 2780 },
];

const STATS = [
  { num: "1,073", label: "CLIENT COMPONENTS" },
  { num: "5.44 MB", label: "EST. CLIENT JS" },
  { num: "643 KB", label: "RECOVERABLE" },
];

const ALL_MS = Math.max(...COL_A.map(l => l.ms), ...COL_B.map(l => l.ms));

export default function Hero() {
  const [tick, setTick] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) { setTick(ALL_MS + 1000); return; }

    const allMs = [...new Set([...COL_A, ...COL_B].map(l => l.ms))].sort((a, b) => a - b);
    const timers = allMs.map(ms => setTimeout(() => setTick(ms), ms + 200));
    return () => timers.forEach(clearTimeout);
  }, []);

  const copy = () => {
    navigator.clipboard.writeText("npx client-creep");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const visA = COL_A.filter(l => l.ms <= tick);
  const visB = COL_B.filter(l => l.ms <= tick);
  const done = tick >= ALL_MS;

  return (
    <section className="hero-outer" id="install">

      {/* ── TOP BAND ── */}
      <div className="hero-top">
        <span className="hero-eyebrow-label">
          Zero config · Static analysis · Next.js 13–16
        </span>

        {/* headline + stats side by side */}
        <div className="hero-main-row">
          <div className="hero-headline-wrap">
            <span className="hero-headline-pre">YOU HAVE</span>
            <span className="hero-headline-main">
              <span className="hero-headline-highlight">CLIENT</span>
            </span>
            <span className="hero-headline-end">CREEP.</span>
          </div>

          <div className="hero-stats-inline">
            {STATS.map(s => (
              <div key={s.num} className="hero-stat-row">
                <div className="hero-stat-num">{s.num}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="hero-cta-row">
          <div className="hero-command">
            <span className="hero-command-text">
              <span className="hero-command-prompt">$</span> npx client-creep
            </span>
            <button
              className={`copy-btn${copied ? " copied" : ""}`}
              onClick={copy}
              aria-label="Copy command"
            >
              {copied ? "copied!" : "copy"}
            </button>
          </div>
          <a
            href="https://github.com/DhruvilChauahan0210/client-creep"
            target="_blank" rel="noopener"
            className="oss-badge"
          >
            ★ Free &amp; Open Source
          </a>
          <a
            href="https://github.com/DhruvilChauahan0210/client-creep"
            target="_blank" rel="noopener"
            className="hero-gh-link"
          >
            GitHub &rarr;
          </a>
        </div>
      </div>

      {/* ── FULL-WIDTH TERMINAL ── */}
      <div className="hero-terminal">
        <div className="hero-terminal-bar">
          <div className="term-dot term-dot-r" />
          <div className="term-dot term-dot-y" />
          <div className="term-dot term-dot-g" />
          <span className="hero-terminal-path">~/dub/apps/web — npx client-creep</span>
        </div>

        <div className="hero-terminal-body">
          {/* Column A */}
          <div className="term-col">
            {visA.map((line, i) => (
              <div key={i} className="term-line" style={{
                color: line.c ?? "#cdd6f4",
                fontWeight: line.bold ? 600 : 400,
              }}>
                {line.t || " "}
              </div>
            ))}
            {done && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12.5px", color: "#333" }}>$ </span>
                <span className="term-cursor" />
              </div>
            )}
          </div>

          {/* Column B */}
          <div className="term-col">
            {visB.map((line, i) => (
              <div key={i} className="term-line" style={{
                color: line.c ?? "#cdd6f4",
                fontWeight: line.bold ? 600 : 400,
              }}>
                {line.t || " "}
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
