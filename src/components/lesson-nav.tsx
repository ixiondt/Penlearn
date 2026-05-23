"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Module } from "@/lib/types";
import { progressGet, progressToggle } from "@/lib/progress";

export function LessonNav({ mod, currentId }: { mod: Module; currentId?: string }) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  // Hydrate completion state from localStorage after mount (no SSR access) — intentional.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setCompleted(progressGet(mod.id)); }, [mod.id]);

  function toggle(id: string) {
    setCompleted(progressToggle(mod.id, id));
  }

  return (
    <aside className="card" style={{ position: "sticky", top: 80, padding: "var(--space-lg)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-fg-3)", marginBottom: "var(--space-sm)" }}>
        MOD {mod.number}
      </div>
      <Link href={`/modules/${mod.id}`} style={{ color: "var(--color-fg-0)", fontWeight: 600 }}>{mod.title}</Link>
      <ol style={{ listStyle: "none", padding: 0, margin: "var(--space-md) 0 0", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {mod.lessons.map((l, i) => {
          const done = completed.has(l.id);
          const active = l.id === currentId;
          return (
            <li key={l.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                type="button"
                aria-label={`Mark ${l.title} ${done ? "incomplete" : "complete"}`}
                onClick={() => toggle(l.id)}
                style={{
                  width: 18, height: 18, minWidth: 18,
                  border: `1px solid ${done ? "var(--color-success)" : "var(--color-border-strong)"}`,
                  background: done ? "var(--color-success)" : "transparent",
                  borderRadius: 4, cursor: "pointer", padding: 0,
                }}
              />
              <Link
                href={`/modules/${mod.id}/${l.id}`}
                style={{
                  color: active ? "var(--color-fg-0)" : "var(--color-fg-2)",
                  fontSize: "0.9375rem",
                  padding: "0.25rem 0",
                  textDecoration: active ? "underline" : "none",
                  textUnderlineOffset: 4,
                  flex: 1,
                }}
              >
                <span style={{ color: "var(--color-fg-3)", fontFamily: "var(--font-mono)", fontSize: "0.75rem", marginRight: "0.5rem" }}>{String(i + 1).padStart(2, "0")}</span>
                {l.title}
              </Link>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
