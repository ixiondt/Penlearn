/**
 * Build-time search index generator.
 * Walks the curriculum, MDX lessons, lab READMEs, and metadata,
 * writes public/search-index.json for the client-side search.
 *
 * Used by: npm run search-index, npm run predev, npm run prebuild
 *
 * Note: this script delegates to src/lib/build-search-index.ts which is
 * also used by the /api/search-index route handler at runtime.
 */
import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSearchIndex } from "../src/lib/build-search-index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

async function main() {
  const entries = await buildSearchIndex(ROOT);
  const outDir = join(ROOT, "public");
  await mkdir(outDir, { recursive: true });
  const outPath = join(outDir, "search-index.json");
  await writeFile(outPath, JSON.stringify(entries));
  const counts = entries.reduce<Record<string, number>>((a, e) => {
    a[e.type] = (a[e.type] ?? 0) + 1;
    return a;
  }, {});
  const summary = Object.entries(counts)
    .map(([k, v]) => `${v} ${k}`)
    .join(", ");
  console.log(`[search-index] wrote ${entries.length} entries (${summary}) → ${outPath}`);
}

main().catch((err) => {
  console.error("[search-index] FAILED:", err);
  process.exit(1);
});
