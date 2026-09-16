/**
 * CTF flag hash authoring tool.
 *
 * Prints the salted SHA-256 (hex) of one or more answers, using the exact same
 * normalization + salt as the browser verifier (src/lib/ctf.ts). Use it to
 * generate `answerHash` values for src/content/challenges.ts, or to confirm an
 * existing hash still matches a known answer.
 *
 *   npx tsx scripts/ctf-hash.ts "PENLEARN{passive_dns_txt_recon}"
 *   npx tsx scripts/ctf-hash.ts "CVE-2021-41773" "185.55.32.10"
 *
 * Node's crypto.subtle mirrors the browser's Web Crypto, so a hash produced here
 * verifies client-side unchanged. Keep this file's constants in lockstep with
 * src/lib/ctf.ts — they are duplicated on purpose so this script has no bundler
 * or path-alias dependency.
 */
import { webcrypto } from "node:crypto";

const CTF_SALT = "penlearn-ctf-2026";

function normalizeFlag(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").toLowerCase();
}

async function hashFlag(raw: string): Promise<string> {
  const data = new TextEncoder().encode(`${CTF_SALT}:${normalizeFlag(raw)}`);
  const digest = await webcrypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function main() {
  const answers = process.argv.slice(2);
  if (answers.length === 0) {
    console.error('usage: npx tsx scripts/ctf-hash.ts "<answer>" ["<answer>" ...]');
    process.exit(1);
  }
  for (const a of answers) {
    console.log(`${await hashFlag(a)}  ${a}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
