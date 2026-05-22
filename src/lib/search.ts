export interface SearchEntry {
  id: string;
  type: "page" | "module" | "lesson" | "lab" | "script" | "attck" | "reference";
  title: string;
  url: string;
  module?: string;
  moduleId?: string;
  snippet: string;
  content?: string;
  tags?: string[];
}

export interface ScoredEntry extends SearchEntry {
  score: number;
  matches: { field: "title" | "tag" | "snippet" | "content" | "url"; token: string }[];
  contextSnippet?: string;
}

// Module-level cache so we fetch the index at most once per page load.
let indexCache: SearchEntry[] | null = null;
let indexPromise: Promise<SearchEntry[]> | null = null;

export async function loadIndex(): Promise<SearchEntry[]> {
  if (indexCache) return indexCache;
  if (indexPromise) return indexPromise;
  indexPromise = (async () => {
    // Try static JSON first (works for both dev with predev hook and static-export deploys),
    // fall back to the live API route so dev mode is never broken by a missing build.
    for (const url of ["/search-index.json", "/api/search-index"]) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (typeof window !== "undefined") {
          console.log(`[penlearn-search] ${url} → status ${res.status}`);
        }
        if (!res.ok) continue;
        const data = (await res.json()) as SearchEntry[];
        if (typeof window !== "undefined") {
          console.log(`[penlearn-search] ${url} → ${Array.isArray(data) ? data.length : "non-array"} entries`);
        }
        if (Array.isArray(data) && data.length > 0) {
          indexCache = data;
          return indexCache;
        }
      } catch (err) {
        if (typeof window !== "undefined") {
          console.warn(`[penlearn-search] fetch ${url} failed:`, err);
        }
      }
    }
    indexCache = [];
    return indexCache;
  })();
  const result = await indexPromise;
  indexPromise = null;
  return result;
}

export function getIndexCacheSize(): number | null {
  return indexCache ? indexCache.length : null;
}

function tokenize(q: string): string[] {
  return q.toLowerCase().trim().split(/\s+/).filter(Boolean);
}

function fieldMatch(haystack: string | undefined, token: string): number {
  if (!haystack) return 0;
  const h = haystack.toLowerCase();
  if (h === token) return 3;
  if (h.startsWith(token)) return 2;
  return h.includes(token) ? 1 : 0;
}

function countOccurrences(haystack: string | undefined, token: string): number {
  if (!haystack) return 0;
  const h = haystack.toLowerCase();
  if (!h.includes(token)) return 0;
  let count = 0;
  let i = 0;
  while (true) {
    const idx = h.indexOf(token, i);
    if (idx === -1) break;
    count++;
    i = idx + token.length;
    if (count > 20) break;
  }
  return count;
}

function buildContext(content: string | undefined, token: string): string | undefined {
  if (!content) return undefined;
  const h = content.toLowerCase();
  const idx = h.indexOf(token);
  if (idx === -1) return undefined;
  const start = Math.max(0, idx - 60);
  const end = Math.min(content.length, idx + token.length + 100);
  const ellipsisStart = start > 0 ? "..." : "";
  const ellipsisEnd = end < content.length ? "..." : "";
  return ellipsisStart + content.slice(start, end) + ellipsisEnd;
}

/**
 * Score entries against a query. Token-based AND-ish:
 * each token must contribute some signal, otherwise the entry is excluded.
 */
export function search(query: string, entries: SearchEntry[], limit = 50): ScoredEntry[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const scored: ScoredEntry[] = [];
  for (const entry of entries) {
    let totalScore = 0;
    const matches: ScoredEntry["matches"] = [];
    let contextSnippet: string | undefined;
    let missedAny = false;

    for (const token of tokens) {
      let tokenScore = 0;

      const titleScore = fieldMatch(entry.title, token);
      if (titleScore) {
        tokenScore += titleScore * 12;
        matches.push({ field: "title", token });
      }

      const tagMatch = (entry.tags || []).some((t) => t.toLowerCase() === token);
      if (tagMatch) {
        tokenScore += 10;
        matches.push({ field: "tag", token });
      } else if ((entry.tags || []).some((t) => t.toLowerCase().includes(token))) {
        tokenScore += 4;
        matches.push({ field: "tag", token });
      }

      const urlScore = fieldMatch(entry.url, token);
      if (urlScore) {
        tokenScore += urlScore * 3;
        matches.push({ field: "url", token });
      }

      const snipScore = fieldMatch(entry.snippet, token);
      if (snipScore) {
        tokenScore += snipScore * 3;
        matches.push({ field: "snippet", token });
      }

      const contentHits = countOccurrences(entry.content, token);
      if (contentHits) {
        tokenScore += Math.min(contentHits, 8);
        matches.push({ field: "content", token });
        if (!contextSnippet) {
          contextSnippet = buildContext(entry.content, token);
        }
      }

      if (tokenScore === 0) {
        missedAny = true;
        break;
      }
      totalScore += tokenScore;
    }

    if (missedAny) continue;

    // Type-based tie-breaker: pages/modules slightly above scripts/attck
    const typeBoost: Record<SearchEntry["type"], number> = {
      page: 2, module: 2, lesson: 1, lab: 1, script: 0, attck: 0, reference: 0,
    };
    totalScore += typeBoost[entry.type];

    scored.push({ ...entry, score: totalScore, matches, contextSnippet });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

export function groupByType(results: ScoredEntry[]): Record<SearchEntry["type"], ScoredEntry[]> {
  const out: Record<string, ScoredEntry[]> = {};
  for (const r of results) {
    if (!out[r.type]) out[r.type] = [];
    out[r.type].push(r);
  }
  return out as Record<SearchEntry["type"], ScoredEntry[]>;
}

export function typeLabel(t: SearchEntry["type"]): string {
  switch (t) {
    case "page":      return "Pages";
    case "module":    return "Modules";
    case "lesson":    return "Lessons";
    case "lab":       return "Labs";
    case "script":    return "Toolkit scripts";
    case "attck":     return "ATT&CK techniques";
    case "reference": return "Reference docs";
  }
}
