"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState, useCallback } from "react";
import { loadIndex, search, groupByType, typeLabel, type ScoredEntry, type SearchEntry } from "@/lib/search";

const orderedTypes: SearchEntry["type"][] = ["lesson", "module", "lab", "script", "attck", "page", "reference"];

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container-app" style={{ paddingBlock: "var(--space-3xl)" }}>Loading…</div>}>
      <SearchPageInner />
    </Suspense>
  );
}

function SearchPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("q") ?? "";
  const [query, setQuery] = useState(initial);
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);

  useEffect(() => { loadIndex().then(setEntries); }, []);

  const results = useMemo<ScoredEntry[]>(() => {
    if (!entries || query.trim().length < 2) return [];
    return search(query, entries, 150);
  }, [query, entries]);

  const grouped = useMemo(() => groupByType(results), [results]);

  const updateUrl = useCallback((v: string) => {
    const next = new URLSearchParams();
    if (v) next.set("q", v);
    router.replace(`/search${next.toString() ? "?" + next.toString() : ""}`, { scroll: false });
  }, [router]);

  return (
    <div className="container-app" style={{ paddingBlock: "var(--space-3xl)" }}>
      <header style={{ marginBottom: "var(--space-2xl)" }}>
        <h1 style={{ marginTop: 0 }}>Search</h1>
        <p style={{ color: "var(--color-fg-1)", maxWidth: "70ch" }}>
          Search across modules, lessons, labs, toolkit scripts, ATT&amp;CK techniques, and
          reference docs. Press <kbd style={kbd}>⌘K</kbd> / <kbd style={kbd}>Ctrl+K</kbd>{" "}
          anywhere on the site to open the quick search modal.
        </p>
      </header>

      <div style={{ display: "flex", gap: "var(--space-md)", alignItems: "center", marginBottom: "var(--space-2xl)" }}>
        <span aria-hidden style={{ color: "var(--color-fg-3)", fontFamily: "var(--font-mono)", fontSize: "1.25rem" }}>⌕</span>
        <input
          autoFocus
          value={query}
          onChange={(e) => { setQuery(e.target.value); updateUrl(e.target.value); }}
          placeholder='Search… try "nmap", "T1003", "msfvenom", "kerberoasting"'
          aria-label="Search query"
          style={{
            flex: 1, background: "var(--color-bg-1)",
            border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)",
            padding: "0.75rem 1rem", outline: "none",
            color: "var(--color-fg-0)", fontSize: "1.0625rem",
          }}
        />
      </div>

      {!entries && (
        <p style={{ color: "var(--color-fg-2)" }}>Loading search index…</p>
      )}

      {entries && query.trim().length < 2 && (
        <Hints onPick={(q) => { setQuery(q); updateUrl(q); }} />
      )}

      {entries && query.trim().length >= 2 && results.length === 0 && (
        <div style={{ color: "var(--color-fg-2)" }}>
          <p style={{ marginTop: 0 }}>No matches for &ldquo;{query}&rdquo;. Try a different term, an ATT&amp;CK ID, or a script name.</p>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-fg-3)" }}>
            Index loaded: <strong style={{ color: entries.length > 0 ? "var(--color-success)" : "var(--color-danger)" }}>{entries.length} entries</strong>
            {entries.length === 0 && (
              <> — the search index is empty. Visit <a href="/api/search-index?debug=1" style={{ color: "var(--color-accent-1)", textDecoration: "underline" }}>/api/search-index?debug=1</a> for diagnostics, or restart the dev server.</>
            )}
          </p>
        </div>
      )}

      {entries && results.length > 0 && (
        <div>
          <p style={{ color: "var(--color-fg-3)", fontSize: "0.875rem", marginBottom: "var(--space-lg)" }}>
            {results.length} match{results.length === 1 ? "" : "es"} for &ldquo;{query}&rdquo;
          </p>
          {orderedTypes.map((t) => {
            const list = grouped[t];
            if (!list || list.length === 0) return null;
            return (
              <section key={t} style={{ marginBottom: "var(--space-2xl)" }}>
                <h2 style={{ fontSize: "1.125rem", color: "var(--color-fg-2)", marginTop: 0, marginBottom: "var(--space-md)" }}>
                  {typeLabel(t)} <span style={{ color: "var(--color-fg-3)", fontSize: "0.875rem" }}>({list.length})</span>
                </h2>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                  {list.map((r) => (
                    <li key={r.id}>
                      <Link href={r.url} className="card card-hover" style={{ display: "flex", flexDirection: "column", gap: "0.375rem", padding: "var(--space-lg)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "var(--space-md)", flexWrap: "wrap" }}>
                          <span style={{ color: "var(--color-fg-0)", fontWeight: 600, fontSize: "1rem" }}>{r.title}</span>
                          {r.module && <span style={{ color: "var(--color-fg-3)", fontSize: "0.8125rem" }}>{r.module}</span>}
                        </div>
                        <span style={{ color: "var(--color-fg-1)", fontSize: "0.9375rem" }}>
                          {r.contextSnippet ?? r.snippet}
                        </span>
                        <span style={{ color: "var(--color-fg-3)", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{r.url}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

const kbd: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: "0.75rem",
  padding: "0.0625rem 0.375rem", border: "1px solid var(--color-border)",
  borderRadius: 4, color: "var(--color-fg-2)",
};

function Hints({ onPick }: { onPick: (q: string) => void }) {
  const groups = [
    { label: "Scripts", items: ["pentest.sh", "msfvenom-gen.sh", "forensics-collect.sh", "bloodhound-import.sh", "osint-passive.sh"] },
    { label: "ATT&CK", items: ["T1003", "T1059.001", "T1558.003", "T1190", "T1539"] },
    { label: "Topics", items: ["nmap", "kerberoasting", "AiTM", "purdue", "sigma", "metasploit"] },
  ];
  return (
    <div style={{ color: "var(--color-fg-2)" }}>
      <p>Try one of these:</p>
      {groups.map((g) => (
        <div key={g.label} style={{ marginBottom: "var(--space-lg)" }}>
          <div style={{ color: "var(--color-fg-3)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.375rem" }}>
            {g.label}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
            {g.items.map((q) => (
              <button key={q} type="button" onClick={() => onPick(q)} className="chip" style={{ cursor: "pointer" }}>
                {q}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
