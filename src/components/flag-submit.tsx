"use client";

import { useEffect, useState } from "react";
import type { Challenge } from "@/lib/types";
import { verifyFlag } from "@/lib/ctf";
import { ctfIsSolved, ctfMarkSolved } from "@/lib/ctf-progress";

type Status = "idle" | "checking" | "correct" | "wrong";

/**
 * A single CTF challenge: prompt, flag input, progressive hints, and local solve
 * tracking. Verification is entirely client-side (salted SHA-256 compare) — the
 * flag never leaves the browser and is never present in the page in plaintext.
 *
 * Usable on the /ctf board and, via MDX, inside a lesson. `onSolved` lets a parent
 * (the board) update an aggregate score; the component also persists the solve
 * itself so it works standalone.
 */
export function FlagSubmit({ challenge, onSolved }: { challenge: Challenge; onSolved?: (id: string) => void }) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [solved, setSolved] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [hintsShown, setHintsShown] = useState(0);

  // Hydrate solved state from localStorage after mount (not available during SSR).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ctfIsSolved(challenge.id)) setSolved(true);
  }, [challenge.id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (solved || !value.trim()) return;
    setStatus("checking");
    const ok = await verifyFlag(value, challenge.answerHash);
    if (ok) {
      ctfMarkSolved(challenge.id);
      setSolved(true);
      setStatus("correct");
      onSolved?.(challenge.id);
    } else {
      setAttempts((a) => a + 1);
      setStatus("wrong");
    }
  }

  const totalHints = challenge.hints?.length ?? 0;

  return (
    <article
      id={challenge.id}
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
        borderColor: solved ? "var(--color-success)" : "var(--color-border)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-md)", alignItems: "baseline", flexWrap: "wrap" }}>
        <h3 style={{ margin: 0, fontSize: "1.0625rem", color: "var(--color-fg-0)" }}>
          {solved && <span aria-hidden style={{ color: "var(--color-success)", marginRight: 6 }}>✓</span>}
          {challenge.title}
        </h3>
        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", alignItems: "center" }}>
          <span className="chip" title="Difficulty">{challenge.difficulty}</span>
          <span className={`chip ${solved ? "chip-ok" : "chip-info"}`}>{challenge.points} pts</span>
        </div>
      </div>

      <p style={{ margin: 0, color: "var(--color-fg-1)", fontSize: "0.9375rem" }}>{challenge.prompt}</p>

      {challenge.attck && challenge.attck.length > 0 && (
        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
          {challenge.attck.map((a) => (
            <span key={a} className={`chip ${a.startsWith("T0") ? "chip-warn" : "chip-info"}`} title="ATT&CK technique">{a}</span>
          ))}
        </div>
      )}

      {solved ? (
        <p style={{ margin: 0, color: "var(--color-success)", fontSize: "0.9375rem", fontWeight: 600 }}>
          Solved — flag accepted.
        </p>
      ) : (
        <form onSubmit={onSubmit} style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap", alignItems: "stretch" }}>
          <input
            type="text"
            value={value}
            onChange={(e) => { setValue(e.target.value); if (status === "wrong") setStatus("idle"); }}
            placeholder={challenge.format}
            aria-label={`Flag for ${challenge.title}`}
            autoComplete="off"
            spellCheck={false}
            style={{
              flex: "1 1 16rem",
              minHeight: 42,
              padding: "0.5rem 0.75rem",
              background: "var(--color-bg-2)",
              border: `1px solid ${status === "wrong" ? "var(--color-danger)" : "var(--color-border-strong)"}`,
              borderRadius: "var(--radius-md)",
              color: "var(--color-fg-0)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.875rem",
            }}
          />
          <button type="submit" className="btn btn-primary" disabled={status === "checking" || !value.trim()}>
            {status === "checking" ? "Checking…" : "Submit flag"}
          </button>
        </form>
      )}

      {status === "wrong" && (
        <p style={{ margin: 0, color: "var(--color-danger)", fontSize: "0.875rem" }}>
          Not the flag. {attempts >= 2 && totalHints > 0 ? "Stuck? Try a hint below." : "Re-check the format and try again."}
        </p>
      )}

      {!solved && totalHints > 0 && (
        <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-sm)" }}>
          {hintsShown === 0 ? (
            <button type="button" className="btn btn-ghost" style={{ fontSize: "0.8125rem", padding: "0.25rem 0.5rem" }} onClick={() => setHintsShown(1)}>
              Show a hint ({totalHints} available)
            </button>
          ) : (
            <>
              <ol style={{ margin: 0, paddingLeft: "1.25rem", color: "var(--color-fg-2)", fontSize: "0.875rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                {challenge.hints!.slice(0, hintsShown).map((h, i) => <li key={i}>{h}</li>)}
              </ol>
              {hintsShown < totalHints && (
                <button type="button" className="btn btn-ghost" style={{ fontSize: "0.8125rem", padding: "0.25rem 0.5rem", marginTop: "0.375rem" }} onClick={() => setHintsShown((n) => n + 1)}>
                  Next hint
                </button>
              )}
            </>
          )}
        </div>
      )}
    </article>
  );
}
