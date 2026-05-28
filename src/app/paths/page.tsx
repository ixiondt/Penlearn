import Link from "next/link";
import { paths, pathMinutes } from "@/content/curriculum";

export const metadata = {
  title: "Learning Paths · Penlearn",
  description: "Role-based routes through the curriculum — pick the path that matches your job.",
};

export default function PathsPage() {
  return (
    <div className="container-app" style={{ paddingBlock: "var(--space-3xl)" }}>
      <header style={{ marginBottom: "var(--space-2xl)" }}>
        <h1 style={{ marginTop: 0 }}>Learning Paths</h1>
        <p style={{ color: "var(--color-fg-1)", maxWidth: "68ch" }}>
          The curriculum is modular, so you don&apos;t have to take it linearly. Each path below is an
          ordered route through the modules tuned for one role — <strong>core</strong> modules are
          essential, <strong>supporting</strong> modules cover the adjacent skills that role needs,
          and <strong>optional</strong> modules are nice-to-have. Every path starts with Foundations.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gap: "var(--space-lg)",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        }}
      >
        {paths.map((p) => {
          const mins = pathMinutes(p);
          const coreCount = p.steps.filter((s) => s.emphasis === "core").length;
          return (
            <Link
              key={p.id}
              href={`/paths/${p.id}`}
              className="card card-hover"
              style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}
            >
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-md)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-fg-3)" }}>
                  PATH
                </div>
                {p.cert && <span className="chip chip-warn" title="Certification alignment">{p.cert}</span>}
              </div>
              <h3 style={{ margin: 0, fontSize: "1.125rem", color: "var(--color-fg-0)" }}>{p.role}</h3>
              <p style={{ margin: 0, color: "var(--color-fg-1)", fontSize: "0.9375rem" }}>{p.tagline}</p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "var(--color-fg-3)",
                  fontSize: "0.8125rem",
                  marginTop: "auto",
                }}
              >
                <span>{p.steps.length} modules · {coreCount} core</span>
                <span>~{Math.round(mins / 30) / 2} hr</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
