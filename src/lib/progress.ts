const KEY = "penlearn.progress.v1";

type Store = Record<string, string[]>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed as Store;
  } catch {
    return {};
  }
}

function write(s: Store) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* quota or disabled */ }
}

export function progressGet(moduleId: string): Set<string> {
  return new Set(read()[moduleId] ?? []);
}

export function progressAll(): Store {
  return read();
}

export function progressToggle(moduleId: string, lessonId: string): Set<string> {
  const store = read();
  const arr = new Set(store[moduleId] ?? []);
  if (arr.has(lessonId)) arr.delete(lessonId);
  else arr.add(lessonId);
  store[moduleId] = [...arr];
  write(store);
  return arr;
}

export function progressClear() {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(KEY); } catch { /* */ }
}
