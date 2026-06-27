import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Penlearn — Offensive & Defensive Security Training",
  description:
    "Lecture and hands-on training across the SecOps toolkit: reconnaissance, exploitation, SOC, incident response, ICS/OT, and reporting.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
        <footer className="container-app" style={{ paddingBlock: "var(--space-3xl)", marginTop: "var(--space-3xl)", borderTop: "1px solid var(--color-border)", color: "var(--color-fg-2)", fontSize: "0.875rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "var(--space-md)" }}>
            <span>Penlearn — offline, bring-your-own-lab.</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-lg)" }}>
              <a href="https://github.com/ixiondt/Pentest" style={{ color: "var(--color-fg-1)" }}>Toolkit on GitHub</a>
              <a href="https://github.com/ixiondt/Pentest/tree/main/books" style={{ color: "var(--color-fg-1)" }}>Books</a>
              <span>Authorized testing only.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
