import Link from "next/link";
import { notFound } from "next/navigation";
import { getPath, paths, getModule, pathMinutes, trackTitle } from "@/content/curriculum";
import { ModeChip } from "@/components/chips";
import type { PathEmphasis } from "@/lib/types";

export function generateStaticParams() {
  return paths.map((p) => ({ pathId: p.id }));
}

export async function generateMetadata(props: { params: Promise<{ pathId: string }> }) {
  const { pathId } = await props.params;
  const p = getPath(pathId);
  if (!p) return { title: "Learning Path · Penlearn" };
  return { title: `${p.role} · Learning Path · Penlearn`, description: p.tagline };
}

function EmphasisChip({ e }: { e: PathEmphasis }) {
  const cls = e === "core" ? "chip chip-ok" : e === "supporting" ? "chip chip-info" : "chip";
  return <span className={cls} title="Emphasis for this role">{e}</span>;
}

export default async function PathPage(props: { params: Promise<{ pathId: string }> }) {
  const { pathId } = await props.params;
  const p = getPath(pathId);
  if (!p) notFound();

  const mins = pathMinutes(p);

  return (
    <div className="container-app" style={{ paddingBlock: "var(--space-3xl)" }}>
      <Link href="/paths" style={{ color: "var(--color-fg-2)", fontSize: "0.875rem" }}>← All paths</Link>

      <header style={{ marginTop: "var(--space-md)", marginBottom: "var(--space-2xl)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", flexWrap: "wrap", marginBottom: "var(--space-md)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-fg-3)" }}>
            LEARNING PATH
          </span>
          {p.cert && <span className="chip chip-warn">{p.cert}</span>}
        </div>
        <h1 style={{ marginTop: 0 }}>{p.role}</h1>
        <p style={{ color: "var(--color-fg-1)", maxWidth: "72ch", fontSize: "1.0625rem" }}>{p.tagline}</p>
        <p style={{ color: "var(--color-fg-1)", maxWidth: "72ch" }}>{p.audience}</p>
        <div style={{ display: "flex", gap: "var(--space-lg)", color: "var(--color-fg-3)", fontSize: "0.875rem", marginTop: "var(--space-md)" }}>
          <span>{p.steps.length} modules</span>
          <span>~{Math.round(mins / 30) / 2} hr total</span>
        </div>
      </header>

      <section style={{ marginBottom: "var(--space-2xl)" }}>
        <h2 style={{ fontSize: "1.125rem", color: "var(--color-fg-2)", marginBottom: "var(--space-md)" }}>
          What you&apos;ll be able to do
        </h2>
        <ul style={{ color: "var(--color-fg-1)", margin: 0, paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          {p.outcomes.map((o) => <li key={o}>{o}</li>)}
        </ul>
      </section>

      <h2 style={{ fontSize: "1.125rem", color: "var(--color-fg-2)", marginBottom: "var(--space-md)" }}>
        The route
      </h2>
      <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        {p.steps.map((step, i) => {
          const mod = getModule(step.moduleId);
          if (!mod) return null;
          const totalMin = mod.lessons.reduce((a, l) => a + l.minutes, 0);
          return (
            <li key={step.moduleId}>
              <Link
                href={`/modules/${mod.id}`}
                className="card card-hover"
                style={{ display: "flex", gap: "var(--space-lg)", alignItems: "flex-start", padding: "var(--space-lg)" }}
              >
                <div style={{ fontFamily: "var(--font-mono)", color: "var(--color-fg-3)", fontSize: "0.875rem", marginTop: "0.125rem", minWidth: 32 }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-md)", alignItems: "baseline", flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0, fontSize: "1.0625rem", color: "var(--color-fg-0)" }}>
                      <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-fg-3)", fontSize: "0.8125rem", marginRight: "0.5rem" }}>
                        MOD {mod.number}
                      </span>
                      {mod.title}
                    </h3>
                    <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                      <EmphasisChip e={step.emphasis} />
                      <ModeChip mode={mod.mode} />
                      <span className="chip">{mod.lessons.length} lessons</span>
                      <span className="chip">~{Math.round(totalMin / 5) * 5} min</span>
                    </div>
                  </div>
                  {step.note && (
                    <p style={{ margin: "var(--space-sm) 0 0", color: "var(--color-accent-1)", fontSize: "0.875rem", fontStyle: "italic" }}>
                      {step.note}
                    </p>
                  )}
                  <p style={{ margin: "var(--space-sm) 0 0", color: "var(--color-fg-1)", fontSize: "0.9375rem" }}>{mod.summary}</p>
                  <div style={{ marginTop: "var(--space-sm)", fontSize: "0.8125rem", color: "var(--color-fg-3)", fontFamily: "var(--font-mono)" }}>
                    {trackTitle(mod.track)}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
