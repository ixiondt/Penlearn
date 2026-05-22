/**
 * Server-side search-index builder. Used by:
 *   - /api/search-index route handler (runtime, cached in module scope)
 *   - scripts/build-search-index.ts (build-time static JSON output)
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { modules, labs } from "@/content/curriculum";
import type { SearchEntry } from "@/lib/search";

function stripMdx(raw: string): string {
  return raw
    .replace(/^---[\s\S]*?---\n/, "")
    .replace(/<[^>]+\/>/g, " ")
    .replace(/<[A-Z][^>]*>[\s\S]*?<\/[A-Z][^>]+>/g, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function snippet(text: string, max = 200): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/\s\S*$/, "") + "...";
}

async function safeRead(path: string): Promise<string> {
  try { return await readFile(path, "utf8"); }
  catch { return ""; }
}

export async function buildSearchIndex(rootDir: string): Promise<SearchEntry[]> {
  const entries: SearchEntry[] = [];

  // ── Static pages ──
  entries.push(
    { id: "page:home", type: "page", title: "Home — Penlearn", url: "/",
      snippet: "Lecture and hands-on training across the SecOps toolkit. Ten modules: recon, exploitation, SOC, IR, ICS/OT, reporting.",
      tags: ["home", "overview"] },
    { id: "page:install", type: "page", title: "Install — SecOps Toolkit Setup", url: "/install",
      snippet: "Clone github.com/ixiondt/Pentest, pick local vs container install, verify with env-check.sh, attach the container to lab networks. nmap, docker, podman, msfconsole reference.",
      tags: ["install", "setup", "docker", "container", "env-check", "nmap"] },
    { id: "page:labs", type: "page", title: "Labs — Bring Your Own Environment", url: "/labs",
      snippet: "Every active-mode lab runs on your own host. Isolation rules, anatomy of a lab, the setup pattern.",
      tags: ["labs", "byol", "docker", "isolation"] },
    { id: "page:reference", type: "page", title: "Reference — scripts and ATT&CK", url: "/reference",
      snippet: "Reverse lookup: jump from a toolkit script or ATT&CK technique to the lessons that teach it.",
      tags: ["reference", "cross-reference"] },
    { id: "page:progress", type: "page", title: "Progress — local-only tracking", url: "/progress",
      snippet: "Lesson completion tracking stored in localStorage. Nothing is sent anywhere.",
      tags: ["progress"] },
    { id: "page:modules", type: "page", title: "Curriculum — All Modules", url: "/modules",
      snippet: "Modules grouped by track: Foundations, Recon, Exploit, SOC, IR, OT, Reporting.",
      tags: ["curriculum", "modules"] },
  );

  // ── Modules ──
  for (const mod of modules) {
    const allAttck = new Set<string>();
    const allScripts = new Set<string>();
    for (const lesson of mod.lessons) {
      (lesson.attck || []).forEach((a) => allAttck.add(a));
      (lesson.scripts || []).forEach((s) => allScripts.add(s));
    }
    entries.push({
      id: `module:${mod.id}`,
      type: "module",
      title: `Module ${mod.number} — ${mod.title}`,
      url: `/modules/${mod.id}`,
      moduleId: mod.id,
      snippet: snippet(mod.summary),
      tags: [...allAttck, ...allScripts, mod.track, mod.mode],
    });
  }

  // ── Lessons (metadata + MDX content) ──
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      const mdxPath = join(rootDir, "src", "content", "lessons", mod.id, `${lesson.id}.mdx`);
      let content = "";
      if (existsSync(mdxPath)) {
        const raw = await safeRead(mdxPath);
        content = stripMdx(raw);
      }
      entries.push({
        id: `lesson:${mod.id}:${lesson.id}`,
        type: "lesson",
        title: lesson.title,
        url: `/modules/${mod.id}/${lesson.id}`,
        module: mod.title,
        moduleId: mod.id,
        snippet: snippet(lesson.summary),
        content: content.slice(0, 6000),
        tags: [
          ...(lesson.attck || []),
          ...(lesson.scripts || []),
          ...(lesson.docs || []),
          lesson.difficulty,
        ],
      });
    }
  }

  // ── Labs ──
  for (const lab of labs) {
    const readmePath = join(rootDir, "labs", lab.id, "README.md");
    let content = "";
    if (existsSync(readmePath)) {
      const raw = await safeRead(readmePath);
      content = stripMdx(raw);
    }
    entries.push({
      id: `lab:${lab.id}`,
      type: "lab",
      title: `Lab ${lab.id} — ${lab.title}`,
      url: `/labs#${lab.id}`,
      snippet: snippet(lab.summary),
      content: content.slice(0, 5000),
      tags: [...lab.targets, ...lab.requires, lab.isolation, lab.authorization],
    });
  }

  // ── Toolkit scripts ──
  const scriptMap = new Map<string, { lessonTitle: string }[]>();
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      for (const script of lesson.scripts || []) {
        if (!scriptMap.has(script)) scriptMap.set(script, []);
        scriptMap.get(script)!.push({ lessonTitle: lesson.title });
      }
    }
  }
  for (const [script, refs] of scriptMap) {
    entries.push({
      id: `script:${script}`,
      type: "script",
      title: `scripts/${script}`,
      url: `/reference#${script}`,
      snippet: `Toolkit script taught in: ${refs.map((r) => r.lessonTitle).join(", ")}`,
      tags: [script, "script", "toolkit"],
    });
  }

  // ── ATT&CK techniques ──
  const attckMap = new Map<string, { lessonTitle: string }[]>();
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      for (const a of lesson.attck || []) {
        if (!attckMap.has(a)) attckMap.set(a, []);
        attckMap.get(a)!.push({ lessonTitle: lesson.title });
      }
    }
  }
  for (const [a, refs] of attckMap) {
    const isIcs = a.startsWith("T0");
    entries.push({
      id: `attck:${a}`,
      type: "attck",
      title: a,
      url: `/reference#${a}`,
      snippet: `${isIcs ? "ICS" : "Enterprise"} ATT&CK technique. Covered in: ${refs.map((r) => r.lessonTitle).join(", ")}`,
      tags: [a, "attck", isIcs ? "ics" : "enterprise"],
    });
  }

  // ── Reference docs ──
  const refDocs = new Set<string>();
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      for (const d of lesson.docs || []) refDocs.add(d);
    }
  }
  for (const doc of refDocs) {
    entries.push({
      id: `reference:${doc}`,
      type: "reference",
      title: doc,
      url: "/reference",
      snippet: `Reference document in the SecOps toolkit. Referenced by lessons.`,
      tags: [doc, "reference", "toolkit"],
    });
  }

  return entries;
}
