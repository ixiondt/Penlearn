import { modules, trackTitle } from "@/content/curriculum";
import { ModuleCard } from "@/components/module-card";
import type { Track } from "@/lib/types";

const trackOrder: Track[] = ["foundations", "recon", "exploit", "soc", "ir", "ot", "report"];

export default function ModulesPage() {
  const byTrack = new Map<Track, typeof modules>();
  for (const t of trackOrder) byTrack.set(t, []);
  for (const m of modules) byTrack.get(m.track)?.push(m);

  return (
    <div className="container-app" style={{ paddingBlock: "var(--space-3xl)" }}>
      <header style={{ marginBottom: "var(--space-2xl)" }}>
        <h1 style={{ marginTop: 0 }}>Curriculum</h1>
        <p style={{ color: "var(--color-fg-1)", maxWidth: "65ch" }}>
          Modules group lessons by track. Foundations is non-optional. Beyond that, the tracks roughly follow the
          SecOps toolkit modes: passive recon → active recon → exploitation → defense → ICS/OT → reporting. You can
          pick the track that matches your role and skip the others, or work through linearly.
        </p>
      </header>

      {trackOrder.map((t) => {
        const list = byTrack.get(t) ?? [];
        if (list.length === 0) return null;
        return (
          <section key={t} style={{ marginBottom: "var(--space-3xl)" }}>
            <h2 style={{ marginBottom: "var(--space-lg)", marginTop: 0, fontSize: "1.25rem", color: "var(--color-fg-2)" }}>
              {trackTitle(t)}
            </h2>
            <div style={{ display: "grid", gap: "var(--space-lg)", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              {list.map((m) => <ModuleCard key={m.id} mod={m} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
