import Link from "next/link";
import { modules } from "@/content/curriculum";
import { ModuleCard } from "@/components/module-card";

export default function Home() {
  const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0);
  const totalLabs = modules.reduce((a, m) => a + m.lessons.filter((l) => l.hasLab).length, 0);

  return (
    <div className="container-app" style={{ paddingBlock: "var(--space-3xl)" }}>
      <section style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-xl)", alignItems: "start" }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-fg-3)", marginBottom: "var(--space-md)", letterSpacing: "0.05em" }}>
            SECOPS TRAINING — OFFLINE FIRST
          </div>
          <h1 style={{ marginTop: 0, marginBottom: "var(--space-lg)", maxWidth: "20ch" }}>
            Learn the SecOps toolkit through structured lessons and labs you run yourself.
          </h1>
          <p style={{ color: "var(--color-fg-1)", fontSize: "1.0625rem", maxWidth: "60ch" }}>
            Ten modules across reconnaissance, exploitation, SOC hunting, incident response, ICS/OT, and reporting.
            Every active-mode lesson ships with a docker-compose lab or a Vagrant layout you spin up on your own
            machine — no shared infrastructure, no offensive tooling running on someone else&apos;s box.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-md)", marginTop: "var(--space-xl)" }}>
            <Link className="btn btn-primary" href="/modules/foundations/authorization">Start: Authorization rules</Link>
            <Link className="btn btn-secondary" href="/modules">Browse curriculum</Link>
            <Link className="btn btn-ghost" href="/install">Install toolkit</Link>
            <Link className="btn btn-ghost" href="/labs">Labs</Link>
          </div>
        </div>

        <div className="card" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "var(--space-lg)" }}>
          <Stat label="Modules" value={modules.length.toString()} />
          <Stat label="Lessons" value={totalLessons.toString()} />
          <Stat label="Hands-on labs" value={totalLabs.toString()} />
          <Stat label="ATT&CK techniques" value="60+" />
        </div>
      </section>

      <section style={{ marginTop: "var(--space-3xl)" }}>
        <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-md)", marginBottom: "var(--space-xl)" }}>
          <h2 style={{ marginTop: 0 }}>Curriculum</h2>
          <Link href="/modules" className="btn btn-ghost" style={{ minHeight: 36, padding: "0.25rem 0.75rem" }}>See all →</Link>
        </header>
        <div style={{ display: "grid", gap: "var(--space-lg)", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {modules.map((m) => <ModuleCard key={m.id} mod={m} />)}
        </div>
      </section>

      <section className="callout callout-warn" style={{ marginTop: "var(--space-3xl)" }}>
        <h4 style={{ marginTop: 0 }}>Standing rule</h4>
        <p style={{ marginBottom: 0 }}>
          Active testing requires written authorization. The labs in this site point at targets you stand up yourself
          on your own host or private network. Never run active modules against systems you don&apos;t own or have
          a scope document for.
        </p>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: "2rem", color: "var(--color-fg-0)", fontWeight: 600, lineHeight: 1 }}>{value}</div>
      <div style={{ color: "var(--color-fg-3)", fontSize: "0.8125rem", marginTop: "0.25rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
    </div>
  );
}
