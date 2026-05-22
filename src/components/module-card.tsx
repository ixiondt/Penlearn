import Link from "next/link";
import type { Module } from "@/lib/types";
import { ModeChip } from "./chips";
import { trackTitle } from "@/content/curriculum";

export function ModuleCard({ mod }: { mod: Module }) {
  const total = mod.lessons.reduce((a, l) => a + l.minutes, 0);
  return (
    <Link href={`/modules/${mod.id}`} className="card card-hover" style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-md)" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-fg-3)" }}>
          MOD {mod.number} · {trackTitle(mod.track)}
        </div>
        <ModeChip mode={mod.mode} />
      </div>
      <h3 style={{ margin: 0, fontSize: "1.125rem", color: "var(--color-fg-0)" }}>{mod.title}</h3>
      <p style={{ margin: 0, color: "var(--color-fg-1)", fontSize: "0.9375rem" }}>{mod.summary}</p>
      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-fg-3)", fontSize: "0.8125rem", marginTop: "auto" }}>
        <span>{mod.lessons.length} lesson{mod.lessons.length === 1 ? "" : "s"}</span>
        <span>~{Math.round(total / 5) * 5} min</span>
      </div>
    </Link>
  );
}
