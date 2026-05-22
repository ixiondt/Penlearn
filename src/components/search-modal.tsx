"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadIndex, search, groupByType, typeLabel, type ScoredEntry, type SearchEntry } from "@/lib/search";

interface Props {
  open: boolean;
  onClose: () => void;
}

const typeChipClass: Record<SearchEntry["type"], string> = {
  page: "chip",
  module: "chip chip-info",
  lesson: "chip chip-info",
  lab: "chip chip-warn",
  script: "chip",
  attck: "chip chip-info",
  reference: "chip",
};

export function SearchModal({ open, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load index on first open
  useEffect(() => {
    if (open && !entries) {
      loadIndex().then(setEntries);
    }
  }, [open, entries]);

  // Focus input on open, clear query on close
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const results = useMemo<ScoredEntry[]>(() => {
    if (!entries || query.trim().length < 2) return [];
    return search(query, entries, 40);
  }, [query, entries]);

  const flatResults = results;
  const grouped = useMemo(() => groupByType(flatResults), [flatResults]);

  const navigate = useCallback((url: string) => {
    onClose();
    router.push(url);
  }, [onClose, router]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
    if (flatResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const choice = flatResults[active];
      if (choice) navigate(choice.url);
    }
  }, [flatResults, active, navigate, onClose]);

  // Scroll active result into view
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-rank="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search Penlearn"
      onKeyDown={onKeyDown}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "color-mix(in oklch, var(--color-bg-0) 70%, transparent)",
        display: "flex", justifyContent: "center", alignItems: "flex-start",
        padding: "10vh 1rem 1rem",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: "100%", maxWidth: 720,
          background: "var(--color-bg-1)",
          border: "1px solid var(--color-border-strong)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          display: "flex", flexDirection: "column",
          maxHeight: "80vh",
          boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", padding: "var(--space-md) var(--space-lg)", borderBottom: "1px solid var(--color-border)" }}>
          <span aria-hidden style={{ color: "var(--color-fg-3)", fontFamily: "var(--font-mono)" }}>⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            placeholder='Search lessons, labs, scripts, ATT&CK… try "nmap" or "T1003"'
            aria-label="Search query"
            style={{
              flex: 1, background: "transparent", border: 0, outline: "none",
              color: "var(--color-fg-0)", fontSize: "1.0625rem", fontFamily: "inherit",
              padding: "0.5rem 0",
            }}
          />
          <kbd style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-fg-3)", padding: "0.125rem 0.375rem", border: "1px solid var(--color-border)", borderRadius: 4 }}>esc</kbd>
        </div>

        <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: "var(--space-sm) 0" }}>
          {!entries && (
            <div style={{ padding: "var(--space-xl)", color: "var(--color-fg-2)", textAlign: "center" }}>
              Loading search index...
            </div>
          )}
          {entries && query.trim().length < 2 && (
            <Hints onPick={(q) => { setQuery(q); setActive(0); }} />
          )}
          {entries && query.trim().length >= 2 && flatResults.length === 0 && (
            <div style={{ padding: "var(--space-xl)", color: "var(--color-fg-2)", textAlign: "center" }}>
              <div>No matches for &ldquo;{query}&rdquo;.</div>
              <div style={{ fontSize: "0.75rem", marginTop: "var(--space-md)", color: "var(--color-fg-3)" }}>
                Index loaded: <strong style={{ color: entries.length > 0 ? "var(--color-success)" : "var(--color-danger)" }}>{entries.length} entries</strong>
                {entries.length === 0 && (
                  <> — visit <a href="/api/search-index?debug=1" style={{ color: "var(--color-accent-1)", textDecoration: "underline" }}>/api/search-index?debug=1</a> for diagnostics</>
                )}
              </div>
            </div>
          )}
          {entries && flatResults.length > 0 && (
            <ResultsList grouped={grouped} active={active} flatResults={flatResults} onPick={navigate} setActive={setActive} />
          )}
        </div>

        <div style={{ display: "flex", gap: "var(--space-md)", justifyContent: "space-between", padding: "0.5rem var(--space-lg)", borderTop: "1px solid var(--color-border)", color: "var(--color-fg-3)", fontSize: "0.75rem", flexWrap: "wrap" }}>
          <span><kbd style={kbd}>↑</kbd> <kbd style={kbd}>↓</kbd> navigate · <kbd style={kbd}>↵</kbd> open · <kbd style={kbd}>esc</kbd> close</span>
          {query && (
            <Link href={`/search?q=${encodeURIComponent(query)}`} onClick={onClose} style={{ color: "var(--color-fg-2)" }}>
              Open full results →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

const kbd: React.CSSProperties = { fontFamily: "var(--font-mono)", fontSize: "0.7rem", padding: "0 0.25rem", border: "1px solid var(--color-border)", borderRadius: 3 };

function Hints({ onPick }: { onPick: (q: string) => void }) {
  const samples = ["nmap", "kerberoasting", "T1003", "msfvenom", "AiTM", "purdue", "sigma", "bloodhound"];
  return (
    <div style={{ padding: "var(--space-lg)" }}>
      <div style={{ color: "var(--color-fg-3)", fontSize: "0.8125rem", marginBottom: "var(--space-sm)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        Try
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
        {samples.map((s) => (
          <button key={s} type="button" onClick={() => onPick(s)} className="chip" style={{ cursor: "pointer" }}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultsList({
  grouped, active, flatResults, onPick, setActive,
}: {
  grouped: Record<SearchEntry["type"], ScoredEntry[]>;
  active: number;
  flatResults: ScoredEntry[];
  onPick: (url: string) => void;
  setActive: (n: number) => void;
}) {
  const orderedTypes: SearchEntry["type"][] = ["lesson", "module", "lab", "script", "attck", "page", "reference"];
  let rank = 0;

  return (
    <div>
      {orderedTypes.map((t) => {
        const list = grouped[t];
        if (!list || list.length === 0) return null;
        return (
          <section key={t}>
            <h3 style={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-fg-3)", margin: 0, padding: "var(--space-md) var(--space-lg) 0" }}>
              {typeLabel(t)}
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {list.map((r) => {
                const myRank = rank++;
                const isActive = myRank === active;
                return (
                  <li key={r.id} data-rank={myRank}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(myRank)}
                      onClick={() => onPick(r.url)}
                      style={{
                        width: "100%", textAlign: "left",
                        background: isActive ? "var(--color-bg-2)" : "transparent",
                        border: 0, padding: "var(--space-md) var(--space-lg)",
                        cursor: "pointer", color: "var(--color-fg-1)",
                        display: "flex", flexDirection: "column", gap: "0.25rem",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "var(--space-md)" }}>
                        <span style={{ color: "var(--color-fg-0)", fontWeight: 500, fontSize: "0.9375rem" }}>
                          {r.title}
                        </span>
                        {r.module && <span style={{ color: "var(--color-fg-3)", fontSize: "0.75rem" }}>{r.module}</span>}
                      </div>
                      <span style={{ color: "var(--color-fg-2)", fontSize: "0.8125rem" }}>
                        {r.contextSnippet ?? r.snippet}
                      </span>
                      <span style={{ color: "var(--color-fg-3)", fontFamily: "var(--font-mono)", fontSize: "0.6875rem" }}>{r.url}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
