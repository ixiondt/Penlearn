"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { modules } from "@/content/curriculum";
import { progressAll, progressClear } from "@/lib/progress";

export default function ProgressPage() {
  const [store, setStore] = useState<Record<string, string[]>>({});
  useEffect(() => { setStore(progressAll()); }, []);

  const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0);
  const totalDone = Object.values(store).reduce((a, list) => a + list.length, 0);
  const pct = totalLessons === 0 ? 0 : Math.round((totalDone / totalLessons) * 100);

  return (
    <div className="container-app" style={{ paddingBlock: "var(--space-3xl)" }}>
      <header style={{ marginBottom: "var(--space-2xl)" }}>
        <h1 style={{ marginTop: 0 }}>Progress</h1>
        <p style={{ color: "var(--color-fg-1)", maxWidth: "70ch" }}>
          Progress is stored locally in your browser — nothing is sent anywhere. Mark lessons complete from inside each lesson.
        </p>
      </header>

      <section className="card" style={{ marginBottom: "var(--space-2xl)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-md)" }}>
          <span style={{ color: "var(--color-fg-0)", fontSize: "1.125rem", fontWeight: 600 }}>Overall</span>
          <span style={{ color: "var(--color-fg-2)" }}>{totalDone} / {totalLessons} lessons · {pct}%</span>
        </div>
        <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} style={{ height: 8, background: "var(--color-bg-2)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "var(--color-accent-1)", transition: "width 240ms cubic-bezier(0.16, 1, 0.3, 1)" }} />
        </div>
      </section>

      <section style={{ display: "grid", gap: "var(--space-lg)", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {modules.map((m) => {
          const done = (store[m.id] ?? []).length;
          const total = m.lessons.length;
          const mPct = total === 0 ? 0 : Math.round((done / total) * 100);
          return (
            <Link key={m.id} href={`/modules/${m.id}`} className="card card-hover">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-sm)" }}>
                <span style={{ color: "var(--color-fg-0)", fontWeight: 600 }}>{m.title}</span>
                <span style={{ color: "var(--color-fg-3)", fontSize: "0.8125rem" }}>{done} / {total}</span>
              </div>
              <div style={{ height: 6, background: "var(--color-bg-2)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: `${mPct}%`, height: "100%", background: "var(--color-accent-1)" }} />
              </div>
            </Link>
          );
        })}
      </section>

      <section style={{ marginTop: "var(--space-2xl)" }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => { if (confirm("Clear all local progress?")) { progressClear(); setStore({}); } }}
        >
          Reset progress
        </button>
      </section>
    </div>
  );
}
