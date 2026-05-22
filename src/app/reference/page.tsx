import Link from "next/link";
import { modules } from "@/content/curriculum";

interface ScriptRef { name: string; lessons: { mod: string; lesson: string; title: string }[]; }
interface AttckRef { id: string; lessons: { mod: string; lesson: string; title: string }[]; }

export default function ReferencePage() {
  const scriptMap = new Map<string, ScriptRef>();
  const attckMap = new Map<string, AttckRef>();
  for (const mod of modules) {
    for (const l of mod.lessons) {
      for (const s of l.scripts ?? []) {
        if (!scriptMap.has(s)) scriptMap.set(s, { name: s, lessons: [] });
        scriptMap.get(s)!.lessons.push({ mod: mod.id, lesson: l.id, title: l.title });
      }
      for (const a of l.attck ?? []) {
        if (!attckMap.has(a)) attckMap.set(a, { id: a, lessons: [] });
        attckMap.get(a)!.lessons.push({ mod: mod.id, lesson: l.id, title: l.title });
      }
    }
  }
  const scripts = [...scriptMap.values()].sort((a, b) => a.name.localeCompare(b.name));
  const attcks = [...attckMap.values()].sort((a, b) => a.id.localeCompare(b.id));

  return (
    <div className="container-app" style={{ paddingBlock: "var(--space-3xl)" }}>
      <header style={{ marginBottom: "var(--space-2xl)" }}>
        <h1 style={{ marginTop: 0 }}>Reference</h1>
        <p style={{ color: "var(--color-fg-1)", maxWidth: "70ch" }}>
          Reverse lookup: jump from a toolkit script or an ATT&CK technique to the lessons that teach it.
        </p>
      </header>

      <section style={{ marginBottom: "var(--space-3xl)" }}>
        <h2 style={{ marginTop: 0 }}>Toolkit scripts</h2>
        <table>
          <thead><tr><th>Script</th><th>Taught in</th></tr></thead>
          <tbody>
            {scripts.map((s) => (
              <tr key={s.name}>
                <td><code>{s.name}</code></td>
                <td>{s.lessons.map((l, i) => (
                  <span key={`${l.mod}-${l.lesson}`}>
                    <Link href={`/modules/${l.mod}/${l.lesson}`}>{l.title}</Link>
                    {i < s.lessons.length - 1 ? ", " : ""}
                  </span>
                ))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>ATT&CK techniques</h2>
        <p style={{ color: "var(--color-fg-2)", fontSize: "0.875rem" }}>
          T1xxx = Enterprise, T0xxx = ICS. Cross-references the lessons that exercise each technique.
        </p>
        <table>
          <thead><tr><th>Technique</th><th>Taught in</th></tr></thead>
          <tbody>
            {attcks.map((a) => (
              <tr key={a.id}>
                <td><code>{a.id}</code></td>
                <td>{a.lessons.map((l, i) => (
                  <span key={`${l.mod}-${l.lesson}`}>
                    <Link href={`/modules/${l.mod}/${l.lesson}`}>{l.title}</Link>
                    {i < a.lessons.length - 1 ? ", " : ""}
                  </span>
                ))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
