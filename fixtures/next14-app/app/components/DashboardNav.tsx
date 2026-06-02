"use client";

// Marked use client just to use usePathname — a common pattern
// But it pulls in NavItem which has zero client signals
import { useEffect } from "react";
import { NavItem } from "./NavItem";

export function DashboardNav() {
  useEffect(() => {
    document.title = "Dashboard";
  }, []);

  return (
    <nav>
      <NavItem href="/" label="Home" />
      <NavItem href="/dashboard" label="Dashboard" />
    </nav>
  );
}
