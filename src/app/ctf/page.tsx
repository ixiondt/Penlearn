"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { challenges, CTF_TOTAL_POINTS } from "@/content/challenges";
import { getLab } from "@/content/curriculum";
import { FlagSubmit } from "@/components/flag-submit";
import { ctfSolvedAll, ctfClear } from "@/lib/ctf-progress";

export default function CtfPage() {
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [resetNonce, setResetNonce] = useState(0);

  // Hydrate solved set from localStorage after mount (unavailable during SSR).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setSolved(new Set(Object.keys(ctfSolvedAll()))); }, []);

  const solvedPoints = useMemo(
    () => challenges.filter((c) => solved.has(c.id)).reduce((a, c) => a + c.points, 0),
    [solved],
  );
  const pct = CTF_TOTAL_POINTS === 0 ? 0 : Math.round((solvedPoints / CTF_TOTAL_POINTS) * 100);

  // Group challenges by lab, preserving registry order.
  const byLab = useMemo(() => {
    const groups: { labId: string; items: typeof challenges }[] = [];
    for (const c of challenges) {
      let g = groups.find((x) => x.labId === c.labId);
      if (!g) { g = { labId: c.labId, items: [] }; groups.push(g); }
      g.items.push(c);
    }
    return groups;
  }, []);

  function handleSolved(id: string) {
    setSolved((prev) => new Set(prev).add(id));
  }

  function handleReset() {
    if (!confirm("Clear all CTF solves? Lesson progress is untouched.")) return;
    ctfClear();
    setSolved(new Set());
    setResetNonce((n) => n + 1); // force FlagSubmit cards to re-read their (now empty) solved state
  }

  return (
    <div className="container-app" style={{ paddingBlock: "var(--space-3xl)" }}>
      <header style={{ marginBottom: "var(--space-2xl)" }}>
        <h1 style={{ marginTop: 0 }}>Capture the Flag</h1>
        <p style={{ color: "var(--color-fg-1)", maxWidth: "70ch", fontSize: "1.0625rem" }}>
          Jeopardy-style challenges over the Penlearn labs. Each flag is recoverable only by
          standing up the linked lab and running the technique — there&apos;s no shortcut in the
          page source. Verification is entirely local: your submission is hashed in the browser
          and compared, nothing is sent anywhere, and your solves live in this browser&apos;s
          storage alone.
        </p>
      </header>

      <section className="callout callout-info" style={{ marginBottom: "var(--space-2xl)" }}>
        <h4 style={{ marginTop: 0 }}>How it works</h4>
        <ol style={{ marginBottom: 0, paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <li>Pick a challenge and open its lab from the section heading.</li>
          <li>Stand the lab up (<code>docker compose up -d</code>), attach the toolkit, and work the technique.</li>
          <li>Recover the flag or the fact, paste it in, and submit. Casing and surrounding spaces don&apos;t matter.</li>
          <li>Planted flags look like <code>PENLEARN&#123;...&#125;</code>; others are a value you recover (a CVE id, an IP, a username).</li>
        </ol>
      </section>

      {/* Score summary */}
      <section className="card" style={{ marginBottom: "var(--space-2xl)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-md)", flexWrap: "wrap", gap: "var(--space-sm)" }}>
          <span style={{ color: "var(--color-fg-0)", fontSize: "1.125rem", fontWeight: 600 }}>Your score</span>
          <span style={{ color: "var(--color-fg-2)" }}>
            {solved.size} / {challenges.length} flags · {solvedPoints} / {CTF_TOTAL_POINTS} pts · {pct}%
          </span>
        </div>
        <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} style={{ height: 8, background: "var(--color-bg-2)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "var(--color-accent-1)", transition: "width 240ms cubic-bezier(0.16, 1, 0.3, 1)" }} />
        </div>
        {pct === 100 && (
          <p style={{ margin: "var(--space-md) 0 0", color: "var(--color-success)", fontWeight: 600 }}>
            All flags captured. Every lab stood up and worked end to end — that&apos;s the whole curriculum, proven.
          </p>
        )}
      </section>

      {byLab.map((group) => {
        const lab = getLab(group.labId);
        const groupSolved = group.items.filter((c) => solved.has(c.id)).length;
        return (
          <section key={group.labId} style={{ marginBottom: "var(--space-2xl)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "var(--space-md)", flexWrap: "wrap", marginBottom: "var(--space-md)" }}>
              <h2 style={{ margin: 0 }}>{lab?.title ?? group.labId}</h2>
              <div style={{ display: "flex", gap: "var(--space-sm)", alignItems: "center" }}>
                <span style={{ color: "var(--color-fg-3)", fontSize: "0.8125rem" }}>{groupSolved} / {group.items.length} solved</span>
                <Link href={`/labs#${group.labId}`} className="btn btn-ghost" style={{ fontSize: "0.8125rem", padding: "0.25rem 0.625rem" }}>
                  Open lab →
                </Link>
              </div>
            </div>
            <div style={{ display: "grid", gap: "var(--space-lg)", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
              {group.items.map((c) => (
                <FlagSubmit key={`${c.id}-${resetNonce}`} challenge={c} onSolved={handleSolved} />
              ))}
            </div>
          </section>
        );
      })}

      <section style={{ marginTop: "var(--space-2xl)", display: "flex", gap: "var(--space-md)", flexWrap: "wrap" }}>
        <Link className="btn btn-secondary" href="/labs">Browse the labs</Link>
        <button type="button" className="btn btn-ghost" onClick={handleReset}>Reset CTF solves</button>
      </section>
    </div>
  );
}
