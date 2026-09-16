// Local-only CTF solve tracking. Same discipline as lib/progress.ts: everything
// lives in localStorage, nothing is ever sent anywhere, every access is wrapped
// so a private window / disabled storage degrades to "no solves" rather than
// throwing. Keyed separately from lesson progress so resetting one leaves the
// other intact.

const KEY = "penlearn.ctf.v1";

/** challengeId → epoch-ms of first solve. */
type SolveStore = Record<string, number>;

function read(): SolveStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    // Coerce to the expected shape; drop anything that isn't a number.
    const out: SolveStore = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function write(s: SolveStore) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* quota or disabled — solves simply won't persist this session */
  }
}

export function ctfSolvedAll(): SolveStore {
  return read();
}

export function ctfIsSolved(id: string): boolean {
  return id in read();
}

/** Record a solve. First solve wins — re-solving keeps the original timestamp. */
export function ctfMarkSolved(id: string): SolveStore {
  const store = read();
  if (!(id in store)) {
    store[id] = Date.now();
    write(store);
  }
  return store;
}

export function ctfClear() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* */
  }
}
