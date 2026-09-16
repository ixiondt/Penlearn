// CTF flag verification — entirely client-side, no backend.
//
// A challenge never ships its flag in plaintext. What ships is the salted
// SHA-256 of the *normalized* answer (see `normalizeFlag`). The learner recovers
// the real flag by doing the lab; we hash their submission the same way and
// compare hex digests. This keeps Penlearn's "no backend, no database" contract
// while still gating each solve on having actually run the lab.
//
// The salt is not a secret — it lives in the client bundle. Its only job is to
// stop someone grepping the shipped JSON against a plain wordlist; the flags are
// recoverable from the labs regardless, which is the point.

export const CTF_SALT = "penlearn-ctf-2026";

/**
 * Normalize a flag before hashing so trivial formatting differences (casing,
 * surrounding whitespace, doubled internal spaces) don't cause a false reject.
 * Applied identically at authoring time (to compute the stored hash) and at
 * submit time (to hash the learner's input).
 */
export function normalizeFlag(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").toLowerCase();
}

/** SHA-256 of `${CTF_SALT}:${normalized}` as lowercase hex, via Web Crypto. */
export async function hashFlag(raw: string): Promise<string> {
  const normalized = normalizeFlag(raw);
  const data = new TextEncoder().encode(`${CTF_SALT}:${normalized}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Constant-time-ish hex compare. Both inputs are fixed 64-char hex, so length is equal. */
export function hexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** True when `submission` matches the challenge's stored hash. */
export async function verifyFlag(submission: string, storedHash: string): Promise<boolean> {
  if (!submission.trim()) return false;
  const h = await hashFlag(submission);
  return hexEqual(h, storedHash.toLowerCase());
}
