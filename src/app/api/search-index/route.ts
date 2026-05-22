import { NextResponse } from "next/server";
import { buildSearchIndex } from "@/lib/build-search-index";
import type { SearchEntry } from "@/lib/search";

export const runtime = "nodejs";
export const revalidate = false;
export const dynamic = "force-dynamic";

let cached: SearchEntry[] | null = null;
let cachedAt = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const debug = searchParams.get("debug") === "1";

  const TTL = 5 * 60 * 1000;
  const now = Date.now();
  let buildError: string | null = null;

  if (!cached || now - cachedAt > TTL) {
    try {
      cached = await buildSearchIndex(process.cwd());
      cachedAt = now;
      console.log(`[/api/search-index] built ${cached.length} entries`);
    } catch (err) {
      buildError = err instanceof Error ? err.message + "\n" + (err.stack ?? "") : String(err);
      console.error("[/api/search-index] FAILED:", buildError);
    }
  }

  if (debug) {
    const counts: Record<string, number> = {};
    for (const e of cached ?? []) counts[e.type] = (counts[e.type] ?? 0) + 1;
    return NextResponse.json({
      cwd: process.cwd(),
      entries: cached?.length ?? 0,
      counts,
      buildError,
      cachedAt: cachedAt ? new Date(cachedAt).toISOString() : null,
      sample: cached?.slice(0, 3) ?? [],
    });
  }

  if (buildError && (!cached || cached.length === 0)) {
    return NextResponse.json(
      { error: "search-index build failed", detail: buildError },
      { status: 500 },
    );
  }

  return NextResponse.json(cached ?? [], {
    headers: { "Cache-Control": "no-store" },
  });
}
