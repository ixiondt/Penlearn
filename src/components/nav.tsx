"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SearchTrigger } from "./search-trigger";

const links = [
  { href: "/", label: "Home" },
  { href: "/modules", label: "Curriculum" },
  { href: "/paths", label: "Paths" },
  { href: "/labs", label: "Labs" },
  { href: "/install", label: "Install" },
  { href: "/reference", label: "Reference" },
  { href: "/progress", label: "Progress" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header style={{ borderBottom: "1px solid var(--color-border)", background: "color-mix(in oklch, var(--color-bg-0) 90%, transparent)", position: "sticky", top: 0, zIndex: 50, backdropFilter: "saturate(180%)" }}>
      <div className="container-app" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, gap: "var(--space-md)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600, color: "var(--color-fg-0)" }}>
          <span aria-hidden style={{ width: 10, height: 10, background: "var(--color-accent-1)", borderRadius: 2, display: "inline-block" }} />
          <span>Penlearn</span>
        </Link>

        <nav className="hidden lg:flex" style={{ gap: "0.25rem", flex: 1, justifyContent: "center" }}>
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className="btn btn-ghost" style={{ minHeight: 36, padding: "0.375rem 0.75rem", color: active ? "var(--color-fg-0)" : "var(--color-fg-2)" }}>
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <SearchTrigger variant="button" />
        </div>

        <div className="lg:hidden" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <SearchTrigger variant="icon" />
          <button className="btn btn-ghost" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen((v) => !v)} style={{ minHeight: 40, padding: "0.375rem 0.75rem" }}>
            <span aria-hidden>{open ? "Close" : "Menu"}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden" style={{ borderTop: "1px solid var(--color-border)", padding: "var(--space-md)" }}>
          <div className="container-app" style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {links.map((l) => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="btn btn-ghost" style={{ justifyContent: "flex-start", color: active ? "var(--color-fg-0)" : "var(--color-fg-2)" }}>
                  {l.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
