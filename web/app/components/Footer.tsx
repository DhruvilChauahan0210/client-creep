import { LogoMark } from "./Logo";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-left">
          <div className="footer-logo">
            <span className="nav-logo-mark" style={{ width: 26, height: 26 }}>
              <LogoMark size={14} />
            </span>
            CLIENT-CREEP
          </div>
          <span className="footer-version">v0.3.0 · MIT</span>
        </div>
        <div className="footer-links">
          {[
            { label: "GitHub", href: "https://github.com/DhruvilChauahan0210/client-creep" },
            { label: "npm", href: "https://www.npmjs.com/package/client-creep" },
            { label: "Issues", href: "https://github.com/DhruvilChauahan0210/client-creep/issues" },
            { label: "ESLint plugin", href: "https://www.npmjs.com/package/eslint-plugin-client-creep" },
          ].map(link => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener" className="footer-link">
              {link.label}
            </a>
          ))}
        </div>
        <p className="footer-note">
          Built by{" "}
          <a href="https://github.com/DhruvilChauahan0210" target="_blank" rel="noopener" style={{ color: "var(--color-midnight-ink)", fontWeight: 500 }}>
            Dhruvil
          </a>
          {" "}· Sizes are estimates (raw source bytes). Run @next/bundle-analyzer for exact bundle impact.
        </p>
      </div>
    </footer>
  );
}
