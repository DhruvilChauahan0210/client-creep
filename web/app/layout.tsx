import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "client-creep — Find out why your Next.js components are client components",
  description: "Zero-setup CLI that traces every client component boundary to its root cause, flags accidental creep, and quantifies the cost. Works on Next.js 13, 14, 15, and 16.",
  openGraph: {
    title: "client-creep",
    description: "Find out why your Next.js components are client components — and what they cost you.",
    url: "https://client-creep.dev",
    siteName: "client-creep",
  },
  twitter: {
    card: "summary_large_image",
    title: "client-creep",
    description: "Find out why your Next.js components are client components — and what they cost you.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
