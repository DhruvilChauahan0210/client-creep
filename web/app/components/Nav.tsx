"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { LogoMark } from "./Logo";

const LINKS = [
  { label: "GitHub", href: "https://github.com/DhruvilChauahan0210/client-creep", external: true },
  { label: "npm", href: "https://www.npmjs.com/package/client-creep", external: true },
  { label: "Docs", href: "#install", external: false },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo" onClick={() => setOpen(false)}>
          <span className="nav-logo-mark">
            <LogoMark size={16} />
          </span>
          CLIENT-CREEP
        </Link>

        <div className="nav-links">
          {LINKS.map(l => (
            <a key={l.label} href={l.href} className="nav-link"
              target={l.external ? "_blank" : undefined}
              rel={l.external ? "noopener" : undefined}>
              {l.label}
            </a>
          ))}
          <a href="#install" className="nav-cta">npx client-creep</a>
        </div>

        <button
          className={`nav-hamburger${open ? " is-open" : ""}`}
          onClick={() => setOpen(o => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span className="hb-line" />
          <span className="hb-line" />
        </button>
      </nav>

      <div className={`mobile-menu${open ? " is-open" : ""}`} aria-hidden={!open}>
        <div className="mobile-menu-inner">
          <nav className="mobile-nav-links">
            {LINKS.map((l, i) => (
              <a key={l.label} href={l.href} className="mobile-nav-link"
                target={l.external ? "_blank" : undefined}
                rel={l.external ? "noopener" : undefined}
                style={{ animationDelay: open ? `${i * 60}ms` : "0ms" }}
                onClick={() => setOpen(false)}>
                {l.label}
                {l.external && <span className="mobile-nav-arrow">↗</span>}
              </a>
            ))}
          </nav>

          <div className="mobile-cta-wrap" style={{ animationDelay: open ? "200ms" : "0ms" }}>
            <a href="#install" className="mobile-cta" onClick={() => setOpen(false)}>
              <span className="mobile-cta-prompt">$</span> npx client-creep
            </a>
            <p className="mobile-cta-hint">No install. No config. Any Next.js version.</p>
          </div>

          <div className="mobile-menu-footer">
            <span className="mobile-menu-footer-text">v0.2.1 · MIT · Made by Dhruvil</span>
          </div>
        </div>
      </div>
    </>
  );
}
