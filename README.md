# Penlearn

Training site for the SecOps toolkit ([github.com/ixiondt/Pentest](https://github.com/ixiondt/Pentest)).
Static Next.js + MDX with bring-your-own-lab docker-compose / Vagrant harnesses,
a live full-text search index, and a 12-module curriculum that spans recon →
exploitation → AI/LLM red-teaming → SOC → IR → ICS/OT → reporting.

**Why "middle path":** lecture content is static and free to serve, but we don't host
vulnerable targets or offensive tooling for users. Every active-mode lab runs on the
learner's own machine. No shared infrastructure, no legal exposure, no per-user
cloud bill.

## Stack

- Next.js 16 (App Router, static export friendly)
- TypeScript strict
- Tailwind v4 + OKLCH color tokens
- MDX for lesson content (`@next/mdx` + remark-gfm + rehype-pretty-code)
- Local-only progress tracking (`localStorage`)
- Search index built at request time via API route (or build-time via `tsx`)
- No backend, no database

## Quick start

```bash
npm install
npx next telemetry disable
npm run dev
# open http://localhost:3000
```

Build, typecheck, lint:

```bash
npm run typecheck
npm run lint
npm run build         # also regenerates public/search-index.json via prebuild
npm run search-index  # regenerate search index by hand
```

## Features

### Curriculum
- **13 modules** across foundations, recon, exploitation, AI/LLM red-teaming, SOC, IR, ICS/OT, malware RE, reporting
- **58 lessons** total — a growing set of fully authored lessons plus stubs that auto-render metadata + toolkit references
- **MDX-based** — drop a new file at `src/content/lessons/<moduleId>/<lessonId>.mdx`, it renders
- **In-lesson `<Checkpoint>` quizzes** — multiple choice with explanations, local-only

### Hands-on labs
- **9 BYOL labs** — docker-compose harnesses you stand up on your own host
- **Private docker networks** (`internal: true`) — vulnerable targets cannot reach the internet
- **Toolkit container attaches per lab** — `--network <lab-network>` pattern
- Labs: workspace scaffold, OSINT, active scan, web app, AD (Vagrant), Metasploit, Sigma authoring, IR practice, AI red-team

### Live search
- **⌘K / Ctrl+K modal** from anywhere on the site
- **`/` keyboard shortcut** (skips when typing in an input)
- **`/search?q=foo`** deep-link page with full results
- **Indexed content:** module/lesson metadata, full MDX text, lab READMEs, toolkit scripts, ATT&CK techniques (T1xxx and T0xxx), reference docs
- **Scoring:** weighted across title / tags / URL / snippet / content with type tiebreakers
- **Dual source:** build-time `public/search-index.json` for static export, runtime `/api/search-index` Node route as fallback

### Progress tracking
- `localStorage`-backed per-lesson completion
- Per-module + overall progress on `/progress`
- Nothing is sent anywhere

### Reference cross-lookup
- `/reference` auto-builds tables from the curriculum
- Jump from a toolkit script to every lesson that teaches it
- Jump from an ATT&CK technique to every lesson that covers it

### Install guide
- `/install` is a full-depth walkthrough — toolkit philosophy, local vs container, what env-check verifies, network attach pattern, volume mounts, container contents (with the "why" for each tool), what's NOT in the container and the rationale, platform notes, troubleshooting

## Project layout

```text
Penlearn/
├── src/
│   ├── app/                          # App Router pages
│   │   ├── page.tsx                  # homepage
│   │   ├── modules/                  # curriculum index + dynamic module/lesson pages
│   │   ├── labs/                     # lab catalog
│   │   ├── install/                  # toolkit install walkthrough
│   │   ├── search/                   # /search?q=foo deep-link results
│   │   ├── reference/                # script + ATT&CK cross-reference
│   │   ├── progress/                 # local progress dashboard
│   │   └── api/
│   │       └── search-index/         # Node route handler — builds index at request time
│   ├── components/                   # nav, cards, chips, checkpoint, lesson-nav, search modal
│   ├── content/
│   │   ├── curriculum.ts             # module / lesson / lab definitions (spine)
│   │   └── lessons/                  # MDX lesson files
│   │       ├── foundations/          # 4 authored
│   │       ├── passive-recon/        # 1 authored
│   │       ├── metasploit/           # 4 authored
│   │       ├── ai-security/          # 3 authored (AI/LLM red-teaming)
│   │       ├── soc-hunt/             # 2 authored
│   │       ├── ir-core/              # 1 authored
│   │       └── ot-ics/               # 1 authored — rest are stubs
│   └── lib/
│       ├── content.ts                # lesson loader
│       ├── progress.ts               # localStorage helpers
│       ├── search.ts                 # client-side scoring + grouping
│       ├── build-search-index.ts     # shared index builder (server)
│       └── types.ts                  # Module / Lesson / Lab types
├── labs/                             # docker-compose / Vagrant lab harnesses
│   ├── 01-workspace/                 # toolkit scaffold
│   ├── 02-osint/                     # passive OSINT with seeded DNS + ground-truth
│   ├── 03-scan-lab/                  # active scan against 5 vulnerable services
│   ├── 04-dvwa-juice/                # web app: DVWA + Juice Shop + vuln-API
│   ├── 05-adlab/                     # GOAD-pointer Vagrant AD guide
│   ├── 06-msf-lab/                   # Metasploit full chain + pivot
│   ├── 07-sigma-lab/                 # OpenSearch + seeded synthetic logs
│   ├── 08-ir-lab/                    # pre-compromised Ubuntu + persistence artifacts
│   ├── 09-ai-redteam/                # garak LLM red-team + intentionally-leaky vuln-chat
│   └── README.md                     # isolation rules + how to add labs
├── scripts/
│   └── build-search-index.ts         # tsx-run build-time index generator
├── public/
│   └── search-index.json             # (generated) — written by prebuild/predev
├── mdx-components.tsx                # MDX component injection
├── next.config.ts                    # MDX + security headers + CSP
├── tsconfig.json
├── package.json
└── README.md                         # this file
```

## How content fits together

Three sources of truth:

1. **`src/content/curriculum.ts`** — the module / lesson / lab definitions. The site
   navigates entirely off this. Add a lesson here first, then write the MDX.
2. **`src/content/lessons/<moduleId>/<lessonId>.mdx`** — the lesson content. If the
   MDX file is missing, the lesson page falls back to a "stub" view that lists the
   metadata + linked toolkit references. You can ship the curriculum first, author over time.
3. **`labs/<labId>/`** — the lab harness. Linked from lessons that have
   `hasLab: true` + `labId`.

The reference page (`/reference`) and the search index both auto-build from the
curriculum. When you add a script or ATT&CK technique to a lesson's metadata, it
shows up in both — no extra registration.

## Adding a lesson

1. Add an entry under the right module's `lessons[]` in `src/content/curriculum.ts`:
   ```ts
   {
     id: "new-lesson",
     title: "...",
     summary: "...",
     minutes: 30,
     difficulty: "core",
     attck: ["T1059.001"],
     scripts: ["pentest.sh"],
     hasLab: true,
     labId: "03-scan-lab",
   }
   ```
2. Create the MDX file: `src/content/lessons/<moduleId>/new-lesson.mdx`. Use the
   existing lessons as templates — the shape is intro paragraph, a few sections,
   a `<Checkpoint>` component, and an action items / next-lesson pointer.
3. Run `npm run search-index` to rebuild the search index, or just restart `npm run dev`.

## Adding a lab

1. Add an entry to `labs[]` in `src/content/curriculum.ts` with the lab metadata.
2. Create `labs/<id>/docker-compose.yml` + `labs/<id>/README.md`. Follow the
   isolation rules in `labs/README.md`:
   - private docker network (`internal: true` or bind to `127.0.0.1`)
   - resource limits on every container
   - pinned image tags, never `:latest`
   - the SecOps toolkit is *not* part of the lab compose — it attaches via
     `--network <lab-network>`
3. Link from one or more lesson entries with `hasLab: true` + `labId: "<id>"`.

## Lesson MDX components

Available inside MDX (auto-injected via `mdx-components.tsx`):

- `<Checkpoint id="..." questions={[...]} />` — multiple-choice quiz. Local-only,
  shows answers + explanations after submit.

Add more by:
1. Creating the component in `src/components/`
2. Adding it to the `useMDXComponents()` return object in `mdx-components.tsx`

## Search architecture

Two parallel paths, both backed by the same `src/lib/build-search-index.ts`:

```text
                                          ┌─────────────────────────────┐
                                          │ src/lib/build-search-index  │
                                          │ (single source of truth)    │
                                          └──────────┬──────────────────┘
                                                     │
              ┌──────────────────────────────────────┴─────────────────────────┐
              ↓                                                                ↓
   ┌─────────────────────────┐                                     ┌──────────────────────┐
   │ scripts/build-search-   │                                     │ src/app/api/         │
   │ index.ts (build-time)   │                                     │ search-index/route.ts│
   │ via tsx, runs on        │                                     │ (request-time Node   │
   │ prebuild / predev       │                                     │  runtime, 5min cache)│
   └────────────┬────────────┘                                     └──────────┬───────────┘
                ↓                                                             ↓
        public/search-index.json                                  /api/search-index (live)
                ↓                                                             ↓
                └──────────────────┬──────────────────────────────────────────┘
                                   ↓
                          src/lib/search.ts
                          loadIndex() — tries static first, falls back to API
                                   ↓
                          search-modal + /search page
```

Static path wins when present (faster, cacheable). API path is the fallback so dev
mode is never broken by a missing build. Production static-export deploys should
rely on the static file.

## Design system

OKLCH dark theme, deliberately *not* the AI-default cyan/purple. Brand color
is a warm amber (`oklch(0.78 0.16 75)`) to differentiate from terminal/IDE
conventions. Neutrals tinted 230 (cool slate). Tailwind v4 utilities for
layout; CSS custom properties (via `@theme`) for tokens — no hardcoded values.

Rules followed (from `~/.claude/CLAUDE.md` § UI & Design Quality):

- No gradient text
- No side-stripe accent borders
- No glassmorphism as default
- No oversized radii (max 12px)
- Mobile-first, lg breakpoint enables side-by-side
- WCAG AA contrast, visible focus rings
- One typeface family, multiple weights

## Privacy

- No telemetry. `NEXT_TELEMETRY_DISABLED=1`.
- No analytics, no third-party scripts, no cookies.
- Progress data is purely `localStorage` — nothing is sent anywhere.
- Search index is served from same-origin only (`/api/search-index`).
- Robots: `noindex, nofollow` by default in `<head>`.

## Security

Production-grade headers via `next.config.ts`:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- Full Content-Security-Policy (no `unsafe-eval` in production; dev needs it for React Refresh)

Run the site behind a reverse proxy (Caddy / Cloudflare) in production for HSTS,
CAA pinning, and additional rate limiting. See `~/.claude/patterns-deploy.md` for
the deployment cookbook.

## Production build

```bash
npm run build      # prebuild generates search-index, then next build
npm run start
```

For static hosting, the site exports cleanly. The `/api/search-index` route works
on Node hosts; for static-only deploys, the build-time `public/search-index.json`
serves the same data.

## License

Content is yours to do with as you please within your own organization.
Toolkit references assume you have the SecOps toolkit installed alongside —
clone from [github.com/ixiondt/Pentest](https://github.com/ixiondt/Pentest).
Nothing here ships the toolkit itself.
