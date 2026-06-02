/**
 * client-creep mark — a root node radiating import connections.
 * Represents the "use client" boundary spreading through a component tree.
 */
export function LogoMark({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* root node — the "use client" boundary */}
      <circle cx="10" cy="10" r="2.5" fill="currentColor" />

      {/* spreading connections — top-left */}
      <line x1="8.2" y1="8.2" x2="4" y2="4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="3.2" cy="3.2" r="1.6" fill="currentColor" opacity="0.55" />

      {/* spreading — top-right */}
      <line x1="11.8" y1="8.2" x2="16" y2="4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="16.8" cy="3.2" r="1.6" fill="currentColor" opacity="0.55" />

      {/* spreading — bottom-left */}
      <line x1="8.2" y1="11.8" x2="4" y2="16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="3.2" cy="16.8" r="1.6" fill="currentColor" opacity="0.3" />

      {/* spreading — bottom-right */}
      <line x1="11.8" y1="11.8" x2="16" y2="16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="16.8" cy="16.8" r="1.6" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

/** Full wordmark — mark + logotype */
export function Logotype({ className }: { className?: string }) {
  return (
    <span className={`logotype${className ? " " + className : ""}`}>
      <LogoMark size={18} />
      CLIENT-CREEP
    </span>
  );
}
