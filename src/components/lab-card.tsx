import Link from "next/link";
import type { Lab } from "@/lib/types";

export function LabCard({ lab }: { lab: Lab }) {
  return (
    <article className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-md)", alignItems: "baseline" }}>
        <h3 style={{ margin: 0, fontSize: "1.125rem", color: "var(--color-fg-0)" }}>{lab.title}</h3>
        <span className={`chip ${lab.isolation === "private-net" ? "chip-warn" : lab.isolation === "air-gapped" ? "chip-danger" : "chip-info"}`}>{lab.isolation}</span>
      </div>
      <p style={{ margin: 0, color: "var(--color-fg-1)", fontSize: "0.9375rem" }}>{lab.summary}</p>
      <dl style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "0.25rem 0.75rem", fontSize: "0.8125rem", margin: 0 }}>
        <dt style={{ color: "var(--color-fg-3)" }}>Targets</dt>
        <dd style={{ margin: 0, color: "var(--color-fg-1)" }}>{lab.targets.join(", ")}</dd>
        <dt style={{ color: "var(--color-fg-3)" }}>Requires</dt>
        <dd style={{ margin: 0, color: "var(--color-fg-1)" }}>{lab.requires.join(", ")}</dd>
      </dl>
      {lab.composeFile && (
        <code style={{ fontSize: "0.75rem" }}>{lab.composeFile}</code>
      )}
      <div style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap" }}>
        <Link href={`/labs#${lab.id}`} className="btn btn-secondary">
          Lab setup
        </Link>
        <Link href="/install" className="btn btn-ghost" style={{ fontSize: "0.875rem" }}>
          Toolkit install
        </Link>
      </div>
    </article>
  );
}
