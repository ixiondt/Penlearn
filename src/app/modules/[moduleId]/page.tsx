import Link from "next/link";
import { notFound } from "next/navigation";
import { getModule, modules, trackTitle } from "@/content/curriculum";
import { AttckChip, DifficultyChip, ModeChip, ScriptChip } from "@/components/chips";

export function generateStaticParams() {
  return modules.map((m) => ({ moduleId: m.id }));
}

export default async function ModulePage(props: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await props.params;
  const mod = getModule(moduleId);
  if (!mod) notFound();

  const totalMin = mod.lessons.reduce((a, l) => a + l.minutes, 0);

  return (
    <div className="container-app" style={{ paddingBlock: "var(--space-3xl)" }}>
      <Link href="/modules" style={{ color: "var(--color-fg-2)", fontSize: "0.875rem" }}>← All modules</Link>

      <header style={{ marginTop: "var(--space-md)", marginBottom: "var(--space-2xl)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", flexWrap: "wrap", marginBottom: "var(--space-md)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-fg-3)" }}>
            MOD {mod.number} · {trackTitle(mod.track)}
          </span>
          <ModeChip mode={mod.mode} />
        </div>
        <h1 style={{ marginTop: 0 }}>{mod.title}</h1>
        <p style={{ color: "var(--color-fg-1)", maxWidth: "70ch", fontSize: "1.0625rem" }}>{mod.summary}</p>
        <div style={{ display: "flex", gap: "var(--space-lg)", color: "var(--color-fg-3)", fontSize: "0.875rem", marginTop: "var(--space-md)" }}>
          <span>{mod.lessons.length} lessons</span>
          <span>~{Math.round(totalMin / 5) * 5} min total</span>
          {mod.prerequisites && mod.prerequisites.length > 0 && (
            <span>Prereqs: {mod.prerequisites.join(", ")}</span>
          )}
        </div>
      </header>

      <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        {mod.lessons.map((l, i) => (
          <li key={l.id}>
            <Link
              href={`/modules/${mod.id}/${l.id}`}
              className="card card-hover"
              style={{ display: "flex", gap: "var(--space-lg)", alignItems: "flex-start", padding: "var(--space-lg)" }}
            >
              <div style={{ fontFamily: "var(--font-mono)", color: "var(--color-fg-3)", fontSize: "0.875rem", marginTop: "0.125rem", minWidth: 32 }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-md)", alignItems: "baseline", flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, fontSize: "1.0625rem", color: "var(--color-fg-0)" }}>{l.title}</h3>
                  <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                    <DifficultyChip d={l.difficulty} />
                    <span className="chip">{l.minutes} min</span>
                    {l.hasLab && <span className="chip chip-warn">lab</span>}
                  </div>
                </div>
                <p style={{ margin: "var(--space-sm) 0 var(--space-md)", color: "var(--color-fg-1)", fontSize: "0.9375rem" }}>{l.summary}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                  {l.attck?.map((a) => <AttckChip key={a} id={a} />)}
                  {l.scripts?.map((s) => <ScriptChip key={s} name={s} />)}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
