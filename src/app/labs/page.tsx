import Link from "next/link";
import { labs } from "@/content/curriculum";

export default function LabsPage() {
  return (
    <div className="container-app" style={{ paddingBlock: "var(--space-3xl)" }}>
      <header style={{ marginBottom: "var(--space-2xl)" }}>
        <h1 style={{ marginTop: 0 }}>Labs — Bring Your Own Environment</h1>
        <p style={{ color: "var(--color-fg-1)", maxWidth: "70ch", fontSize: "1.0625rem" }}>
          Penlearn labs are the hands-on half of the curriculum. Every active-mode lesson
          has a matching lab where you exercise the technique against a target you stand
          up yourself. This page covers the design principles, the isolation rules that
          keep things safe, the setup pattern that&apos;s consistent across every lab, and
          the catalog of available labs.
        </p>
      </header>

      <section className="callout callout-info" style={{ marginBottom: "var(--space-2xl)" }}>
        <h4 style={{ marginTop: 0 }}>First time? Install the SecOps toolkit</h4>
        <p style={{ marginBottom: "var(--space-md)" }}>
          Every lab references the toolkit container (<code>secops-toolkit:latest</code>) or
          the toolkit&apos;s scripts. The toolkit is hosted at{" "}
          <a href="https://github.com/ixiondt/Pentest" style={{ color: "var(--color-accent-1)", textDecoration: "underline", textUnderlineOffset: 4 }}>
            github.com/ixiondt/Pentest
          </a>
          {" "}— clone it, install it once, then every lab works.
        </p>
        <Link href="/install" className="btn btn-primary" style={{ marginRight: "var(--space-md)" }}>Install guide →</Link>
        <Link href="/modules/foundations/engagement-workflow" className="btn btn-secondary">Engagement workflow lesson</Link>
      </section>

      {/* ───────── WHY BYOL ───────── */}
      <section style={{ marginTop: "var(--space-2xl)" }}>
        <h2 style={{ marginTop: 0 }}>Why bring-your-own-lab</h2>
        <p>
          Most security training platforms host the labs for you — you VPN into a target
          range, exploit a pre-staged target, get a flag, leave. That model has obvious
          benefits (zero setup, instant access) and one major drawback for the kind of
          training Penlearn does: <strong>you don&apos;t get to see how the targets are
          built.</strong> Knowing &quot;run sqlmap and capture the flag&quot; isn&apos;t
          the same as knowing &quot;this is a Drupal 7 install with a deliberately broken
          input filter on the search page, and here&apos;s the patch that would have
          prevented it.&quot;
        </p>
        <p>
          Penlearn&apos;s labs ship as <code>docker-compose.yml</code> + a{" "}
          <code>targets/</code> directory you can read. The vulnerabilities are visible —
          the seed scripts in the IR lab actively describe what they&apos;re planting; the
          OSINT lab&apos;s ground-truth file documents what passive recon should find.
          You learn the offensive technique <em>and</em> the defensive perspective in the
          same exercise.
        </p>
        <p>The other reasons BYOL is the right model here:</p>
        <ul>
          <li>
            <strong>Cost.</strong> Per-user ephemeral cloud VMs cost real money. A
            self-hosted lab on your own machine is free for as long as you want to run it.
          </li>
          <li>
            <strong>Legal exposure.</strong> Hosting offensive tooling and intentionally
            vulnerable targets on shared cloud infrastructure invites disputes with the
            cloud provider (and possibly law enforcement, depending on the lab content).
            Your machine, your responsibility, your jurisdiction.
          </li>
          <li>
            <strong>Realism.</strong> Real engagements involve setup. The discipline of
            standing up a target, isolating it, attacking it, and tearing it down is part
            of what you&apos;re learning — not friction to avoid.
          </li>
        </ul>
      </section>

      {/* ───────── ISOLATION ───────── */}
      <section className="callout callout-danger" style={{ marginTop: "var(--space-2xl)" }}>
        <h4 style={{ marginTop: 0 }}>Isolation rules — non-negotiable</h4>
        <ul style={{ marginBottom: 0 }}>
          <li><strong>Private docker network.</strong> Vulnerable targets must never be exposed on a routable interface. Use <code>internal: true</code> bridges or bind only to <code>127.0.0.1</code>.</li>
          <li><strong>No host port-forwards on prod machines.</strong> Run labs on a dedicated machine, a VM, or WSL2 with the network locked down.</li>
          <li><strong>Tear down between sessions.</strong> <code>docker compose down -v</code> when finished. Persistent containers carry persistent risk.</li>
          <li><strong>Never point active tools at someone else&apos;s target.</strong> The toolkit&apos;s standing rule (CLAUDE.md §8) is enforced by you, not the site.</li>
        </ul>
      </section>

      <section style={{ marginTop: "var(--space-2xl)" }}>
        <h2 style={{ marginTop: 0 }}>How docker isolation actually works</h2>
        <p>
          The lab compose files use <code>internal: true</code> on their networks, which
          tells docker to <strong>not</strong> create a bridge to the host&apos;s default
          route. Containers attached to that network can reach each other but cannot reach
          the internet or anything else outside docker. The toolkit container attaches via
          {" "}<code>--network &lt;lab-network&gt;</code> at run time, which gives the
          toolkit access to the lab — and only the lab.
        </p>
        <pre><code>{`# What a typical lab compose declares
networks:
  scan:
    driver: bridge
    internal: true       # ← this is the safety mechanism
    ipam:
      config:
        - subnet: 10.60.0.0/24

# What docker network ls shows after \`docker compose up -d\`
NETWORK ID     NAME                   DRIVER    SCOPE
abc123def      penlearn-scan_scan     bridge    local

# Toolkit attaches to that network — only place it can route to
docker run --rm -it \\
  --network penlearn-scan_scan \\
  --cap-add NET_RAW \\
  secops-toolkit:latest bash`}</code></pre>
        <p>
          The reason this matters: if you accidentally pointed{" "}
          <code>./scripts/pentest.sh 10.60.0.0/24</code> at the wrong network because the
          target was on a routable interface, you could be scanning a real production
          subnet at a customer or a neighbor. <code>internal: true</code> means the network
          literally can&apos;t leave the docker host, so even a mistaken target IP can&apos;t
          do harm beyond the lab.
        </p>
        <p>
          A few labs (the Sigma authoring lab, the IR lab) <em>do</em> bind ports to{" "}
          <code>127.0.0.1</code> because they include a UI you access from your browser
          (OpenSearch Dashboards). The principle is the same: bind to localhost, never to
          <code>0.0.0.0</code>, so the lab is reachable only from the same host.
        </p>
      </section>

      {/* ───────── ANATOMY ───────── */}
      <section style={{ marginTop: "var(--space-2xl)" }}>
        <h2 style={{ marginTop: 0 }}>Anatomy of a Penlearn lab</h2>
        <p>
          Every lab follows the same structure. Once you&apos;ve done one, you can read
          another quickly because the parts are in the same places.
        </p>
        <pre><code>{`labs/<id>/
├── README.md                  ← what the lab does, exercises, success criteria
├── docker-compose.yml         ← the targets (never the toolkit itself)
├── targets/                   ← seed data: zone files, config, vulnerable apps
│   ├── ground-truth.md        ← (some labs) the answer key, do-not-read-first
│   └── ...
└── solutions/                 ← (some labs) reference walkthroughs`}</code></pre>

        <h3 style={{ fontSize: "1.0625rem" }}>The compose file</h3>
        <p>
          The lab&apos;s <code>docker-compose.yml</code> declares <em>only the targets</em> —
          never the toolkit. This is deliberate: it keeps the lab definitions reusable across
          toolkit versions. You can rebuild the toolkit image without restarting the lab,
          and you can run the same lab against different toolkit branches for comparative
          testing.
        </p>

        <h3 style={{ fontSize: "1.0625rem" }}>The README</h3>
        <p>Every lab README has the same five sections:</p>
        <ul>
          <li><strong>What you&apos;ll practice</strong> — the learning objective</li>
          <li><strong>Setup</strong> — <code>docker compose up -d</code> + verification commands</li>
          <li><strong>Run the toolkit</strong> — the exact <code>docker run</code> with the right network and mounts</li>
          <li><strong>Exercises</strong> — ordered, each building on the last</li>
          <li><strong>Success criteria</strong> — checklist you can self-assess against</li>
          <li><strong>Tear down</strong> — <code>docker compose down -v</code> + cleanup</li>
        </ul>

        <h3 style={{ fontSize: "1.0625rem" }}>The targets directory</h3>
        <p>
          When a lab needs config files, seed data, or vulnerable application source, they
          live under <code>targets/</code> and are read-only volume-mounted into the
          containers. This makes the lab self-contained and lets you inspect what&apos;s
          being served before you run it. Read the seed data <em>after</em> you finish
          the exercises — looking first defeats the investigation.
        </p>
      </section>

      {/* ───────── THE PATTERN ───────── */}
      <section style={{ marginTop: "var(--space-2xl)" }}>
        <h2 style={{ marginTop: 0 }}>The setup pattern (memorize this once)</h2>
        <p>
          Every active-mode lab follows the same four-step pattern. Memorize it once;
          it applies to every lab.
        </p>
        <pre><code>{`# 1. Stand up the lab
cd labs/<id>
docker compose up -d
docker compose ps          # confirm all targets healthy

# 2. Find the lab's docker network name
docker network ls | grep penlearn
# e.g.  penlearn-scan_scan

# 3. Run the toolkit attached to that network, with volume mounts
docker run --rm -it \\
  --network penlearn-scan_scan \\
  --cap-add NET_RAW \\
  -v ~/assessments:/root/assessments \\
  -v ~/incidents:/root/incidents \\
  -v "$PWD/work:/work" \\
  -w /work \\
  secops-toolkit:latest bash

# 4. Inside the toolkit container — scaffold engagement and run the lesson
./scripts/engagement-init.sh practice-<lab> --type infra
./scripts/pentest.sh target.lab.local 10.x.x.0/24
# ... per the lab README's Exercises section

# When done — tear it all down
exit                       # leave the container
docker compose down -v     # remove the lab containers and volumes`}</code></pre>
        <p>
          The flags do specific work and aren&apos;t optional:
        </p>
        <ul>
          <li><code>--rm</code> — container is destroyed on exit (no orphan toolkit containers)</li>
          <li><code>--network &lt;lab-net&gt;</code> — attaches to the lab&apos;s isolated network</li>
          <li><code>--cap-add NET_RAW</code> — gives nmap permission for raw sockets</li>
          <li><code>-v ~/assessments:/root/assessments</code> — engagement output survives container teardown</li>
          <li><code>-v $PWD/work:/work -w /work</code> — host-side persistent workdir for the lab&apos;s outputs</li>
        </ul>
      </section>

      {/* ───────── DIFFICULTY ───────── */}
      <section style={{ marginTop: "var(--space-2xl)" }}>
        <h2 style={{ marginTop: 0 }}>Reading the lab catalog</h2>
        <p>
          The catalog below has chips that tell you what to expect. Read them before
          committing time to a lab:
        </p>
        <ul>
          <li>
            <strong>Isolation: host-only</strong> — toolkit egresses to the internet (for
            passive sources like CT logs); no inbound from anywhere. Safe to run on a
            general-purpose machine.
          </li>
          <li>
            <strong>Isolation: private-net</strong> — vulnerable targets on an{" "}
            <code>internal: true</code> network. Cannot reach the internet, cannot be
            reached. Safer than host-only for active-attack labs.
          </li>
          <li>
            <strong>Isolation: air-gapped</strong> — labs that simulate disconnected
            environments. Both targets and toolkit on internal networks, no external
            DNS resolution.
          </li>
        </ul>
        <p>
          Labs marked &quot;Vagrant&quot; (AD lab) require a hypervisor and ~32 GB RAM —
          treat them as a weekend commitment rather than a 90-minute session. Everything
          else is docker-compose and fits comfortably on 8 GB.
        </p>
      </section>

      {/* ───────── CATALOG ───────── */}
      <section style={{ marginTop: "var(--space-2xl)" }}>
        <h2 style={{ marginTop: 0 }}>Lab catalog</h2>
        <p>
          Each card below links to the matching lesson and to the lab&apos;s anchor on
          this page. The lab&apos;s on-disk README has the exercises.
        </p>
        <div style={{ display: "grid", gap: "var(--space-lg)", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", marginTop: "var(--space-lg)" }}>
          {labs.map((lab) => (
            <article id={lab.id} key={lab.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-md)", alignItems: "baseline" }}>
                <h3 style={{ margin: 0, fontSize: "1.0625rem", color: "var(--color-fg-0)" }}>{lab.title}</h3>
                <span className={`chip ${lab.isolation === "private-net" ? "chip-warn" : lab.isolation === "air-gapped" ? "chip-danger" : "chip-info"}`}>{lab.isolation}</span>
              </div>
              <p style={{ margin: 0, color: "var(--color-fg-1)", fontSize: "0.9375rem" }}>{lab.summary}</p>
              <dl style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "0.25rem 0.75rem", fontSize: "0.8125rem", margin: 0 }}>
                <dt style={{ color: "var(--color-fg-3)" }}>Targets</dt>
                <dd style={{ margin: 0 }}>{lab.targets.join(", ")}</dd>
                <dt style={{ color: "var(--color-fg-3)" }}>Requires</dt>
                <dd style={{ margin: 0 }}>{lab.requires.join(", ")}</dd>
                {lab.composeFile && (<>
                  <dt style={{ color: "var(--color-fg-3)" }}>Compose</dt>
                  <dd style={{ margin: 0, fontFamily: "var(--font-mono)" }}>{lab.composeFile}</dd>
                </>)}
                {lab.hasVagrant && (<>
                  <dt style={{ color: "var(--color-fg-3)" }}>Vagrant</dt>
                  <dd style={{ margin: 0, fontFamily: "var(--font-mono)" }}>labs/{lab.id}/Vagrantfile</dd>
                </>)}
              </dl>
            </article>
          ))}
        </div>
      </section>

      <nav style={{ marginTop: "var(--space-3xl)", display: "flex", gap: "var(--space-md)", flexWrap: "wrap" }}>
        <Link className="btn btn-primary" href="/install">Install the toolkit</Link>
        <Link className="btn btn-secondary" href="/modules">Browse curriculum</Link>
      </nav>
    </div>
  );
}
