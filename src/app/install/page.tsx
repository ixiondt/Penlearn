import Link from "next/link";

export const metadata = {
  title: "Install — SecOps Toolkit Setup",
};

const REPO_URL = "https://github.com/ixiondt/Pentest.git";
const REPO_WEB = "https://github.com/ixiondt/Pentest";

export default function InstallPage() {
  return (
    <div className="container-app" style={{ paddingBlock: "var(--space-3xl)" }}>
      <header style={{ marginBottom: "var(--space-2xl)" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-fg-3)", marginBottom: "var(--space-sm)", letterSpacing: "0.05em" }}>
          PREREQUISITE FOR EVERY LAB
        </div>
        <h1 style={{ marginTop: 0 }}>Installing the SecOps toolkit</h1>
        <p style={{ color: "var(--color-fg-1)", maxWidth: "70ch", fontSize: "1.0625rem" }}>
          Penlearn is the curriculum. The SecOps toolkit is the actual tooling — 41 scripts,
          14 reference checklists, 16 templates, a command catalog, and a Kali-based container
          that bundles every dependency. This page walks through the install, but more
          importantly it explains <em>why</em> the toolkit is built the way it is — because
          understanding the install is the first step toward operating it well.
        </p>
      </header>

      {/* ───────── PHILOSOPHY ───────── */}
      <section style={{ marginTop: "var(--space-2xl)" }}>
        <h2 style={{ marginTop: 0 }}>What is the SecOps toolkit?</h2>
        <p>
          Most &quot;pentest distributions&quot; (Kali, Parrot, BlackArch) are <em>collections of tools</em>.
          You boot the distro, you have nmap and Metasploit and Burp Suite installed, and you
          figure out your own workflow on top. That works for individual learners, but it
          falls apart the moment you have an engagement to deliver: every operator builds a
          different directory structure, finds different output formats, writes reports
          differently, and onboarding a new analyst means re-teaching every convention.
        </p>
        <p>
          The SecOps toolkit takes a different stance. It assumes the tools exist (Kali ships
          them) and focuses on <strong>the workflow on top of the tools</strong>:
        </p>
        <ul>
          <li>
            <strong>One scaffold per engagement.</strong> The directory layout is fixed
            (CLAUDE.md §7). Every script reads and writes to the same paths. Findings flow
            from <code>nmap</code> → <code>cve-lookup</code> → <code>risk-scoring</code> →{" "}
            <code>scan-db</code> → <code>report-generator</code> without ever leaving the
            convention.
          </li>
          <li>
            <strong>Generate-by-default, execute-on-confirm.</strong> Active tools
            (containment, msfvenom, persistence audit) produce a script you can read
            <em> before</em> you run it. The default is to draft; the explicit flag is to act.
            This protects against the &quot;fat-fingered an IP and took down prod&quot; failure mode.
          </li>
          <li>
            <strong>Chain of custody for everything.</strong> Every forensic artifact, every
            generated payload, every finding gets a SHA-256 hash and a manifest. Six months
            later you can prove what was acquired when, by whom, and that it hasn&apos;t
            been modified.
          </li>
          <li>
            <strong>One convention, two modes.</strong> The same scaffolding works for{" "}
            <em>offensive</em> engagements (assessments, pentests, red team) and{" "}
            <em>defensive</em> engagements (incident response, threat hunts, restoration).
            Different directory roots (<code>~/assessments</code> vs <code>~/incidents</code>),
            same discipline.
          </li>
        </ul>
        <p>
          You can use the toolkit without buying into this philosophy — every script works
          standalone. But the value compounds when you use the conventions, because the
          downstream scripts assume them. <code>scan-db.py</code> can correlate findings
          across engagements because every engagement uses the same layout. The DOCX report
          generator can produce a finished deliverable because the findings JSON has a known
          shape. The toolkit&apos;s value is mostly in those connections.
        </p>
      </section>

      {/* ───────── WHERE IT LIVES ───────── */}
      <section style={{ marginTop: "var(--space-2xl)" }}>
        <h2 style={{ marginTop: 0 }}>Where the toolkit lives</h2>
        <p>
          The toolkit is hosted on GitHub at{" "}
          <a href={REPO_WEB} style={{ color: "var(--color-accent-1)", textDecoration: "underline", textUnderlineOffset: 4 }}>
            {REPO_WEB}
          </a>
          . Penlearn references it as a sibling directory (<code>../pentest</code>) by
          convention, but you can clone it anywhere — the labs only require the container
          image (<code>secops-toolkit:latest</code>) to be built and available, or the
          scripts to be on your <code>PATH</code>.
        </p>
        <div className="callout callout-info">
          <h4 style={{ marginTop: 0 }}>Why a separate repository?</h4>
          <p style={{ marginBottom: 0 }}>
            The toolkit is operational tooling. Penlearn is curriculum. They evolve on
            different timelines: the toolkit gets new scripts when a new TTP needs codifying;
            Penlearn gets new lessons when a topic is ready to teach. Mixing them in one
            repo would entangle &quot;I&apos;m adding a script&quot; commits with &quot;I&apos;m fixing
            a typo in a lesson&quot; commits, and you&apos;d lose the ability to ship the
            toolkit independently to other teams who don&apos;t care about the training.
            Two repos, one shared discipline.
          </p>
        </div>
      </section>

      {/* ───────── STEP 1 ───────── */}
      <section style={{ marginTop: "var(--space-2xl)" }}>
        <h2 style={{ marginTop: 0 }}>Step 1 — Clone the toolkit</h2>
        <p>
          Standard git clone. There&apos;s nothing exotic about the repo&apos;s layout — top-level{" "}
          <code>install.sh</code>, scripts under <code>scripts/</code>, docs under{" "}
          <code>docs/</code>, references under <code>data/</code>. If you&apos;re following
          the Penlearn convention, clone it as a sibling:
        </p>
        <pre><code>{`# Penlearn is at ~/Projects/Penlearn — put pentest beside it
cd ~/Projects
git clone ${REPO_URL} pentest
cd pentest`}</code></pre>
        <p>
          Pin to a specific commit or tag if you&apos;re running this on an engagement and
          need a fixed version of the tooling — the toolkit&apos;s scripts evolve, and
          reproducibility matters. Every engagement&apos;s <code>00-MANIFEST.json</code>
          (written by <code>engagement-init.sh</code>) records the toolkit&apos;s git SHA
          at scaffold time, so you can later trace which version of the scripts produced
          your findings.
        </p>
        <pre><code>{`# Pin to a tag (recommended for engagement work)
git clone ${REPO_URL} pentest
cd pentest
git checkout v4.2          # or whatever the current tag is

# Or pin to a specific commit
git checkout abc123def`}</code></pre>
        <p style={{ color: "var(--color-fg-2)", fontSize: "0.9375rem" }}>
          <strong>Why pinning matters:</strong> if a script gets updated mid-engagement and
          your output JSON shape changes, the downstream <code>report-generator.py</code>
          can fail in subtle ways. Pinning the toolkit for the duration of an engagement
          (and recording the SHA in the manifest) is cheap insurance.
        </p>
      </section>

      {/* ───────── STEP 2 ───────── */}
      <section style={{ marginTop: "var(--space-2xl)" }}>
        <h2 style={{ marginTop: 0 }}>Step 2 — Pick local or container install</h2>
        <p>
          The toolkit ships two install paths, and the choice is more consequential than it
          looks. Read both before picking.
        </p>

        <div style={{ display: "grid", gap: "var(--space-lg)", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", marginTop: "var(--space-lg)" }}>
          <article className="card">
            <h3 style={{ marginTop: 0, fontSize: "1.0625rem" }}>Local install</h3>
            <pre><code>{`# Full install
./install.sh local

# Minimal — core only, skip Go tools / Ruby / wordlists / network analysis
./install.sh local --minimal`}</code></pre>
            <h4 style={{ fontSize: "0.9375rem", color: "var(--color-fg-0)" }}>Pick this when</h4>
            <ul style={{ fontSize: "0.875rem" }}>
              <li>You&apos;re already on Kali, Ubuntu 22.04+, or Debian 12+</li>
              <li>You want the tools on your normal <code>PATH</code> for ad-hoc use</li>
              <li>You don&apos;t need network isolation between toolkit and host</li>
              <li>You&apos;re doing report generation or passive recon (low blast radius)</li>
            </ul>
            <h4 style={{ fontSize: "0.9375rem", color: "var(--color-fg-0)" }}>Tradeoffs</h4>
            <p style={{ fontSize: "0.875rem", color: "var(--color-fg-2)", margin: 0 }}>
              Installs into <code>~/go/bin/</code>, <code>~/.local/bin/</code>, and apt
              system paths. Modifies <code>~/.bashrc</code> to extend PATH. Your host inherits
              every dependency the toolkit installs — fine if you trust the inventory, but
              it&apos;s a lot of attack surface to add to a workstation you also use for
              email and browsing.
            </p>
          </article>

          <article className="card">
            <h3 style={{ marginTop: 0, fontSize: "1.0625rem" }}>Container install</h3>
            <pre><code>{`# Auto-detects docker or podman
./install.sh container

# Or build directly
docker build -t secops-toolkit:latest .
podman build -t secops-toolkit:latest .`}</code></pre>
            <h4 style={{ fontSize: "0.9375rem", color: "var(--color-fg-0)" }}>Pick this when</h4>
            <ul style={{ fontSize: "0.875rem" }}>
              <li>You want the toolkit isolated from the host (recommended)</li>
              <li>You&apos;re running the Penlearn labs (the labs assume the container)</li>
              <li>You need the same environment across multiple workstations / a team</li>
              <li>You&apos;re on macOS or Windows (no native option there anyway)</li>
            </ul>
            <h4 style={{ fontSize: "0.9375rem", color: "var(--color-fg-0)" }}>Tradeoffs</h4>
            <p style={{ fontSize: "0.875rem", color: "var(--color-fg-2)", margin: 0 }}>
              Multi-stage build (Alpine Go builder → Kali Rolling base), ~2.5 GB final image.
              First build takes 10-15 minutes; subsequent rebuilds are cached. Requires
              passing <code>--cap-add NET_RAW</code> for some scripts (nmap raw sockets),
              and you need volume mounts for output to survive container teardown.
            </p>
          </article>
        </div>

        <div className="callout callout-info" style={{ marginTop: "var(--space-lg)" }}>
          <h4 style={{ marginTop: 0 }}>Recommendation</h4>
          <p style={{ marginBottom: 0 }}>
            <strong>Container for engagements and labs; local for occasional ad-hoc use.</strong>{" "}
            The container is reproducible across machines, easy to tear down, and isolates
            the toolkit&apos;s dependencies from your host. The only reason to prefer local
            is the <em>occasional</em> ad-hoc scan where spinning up a container feels like
            ceremony.
          </p>
        </div>
      </section>

      {/* ───────── STEP 3 ───────── */}
      <section style={{ marginTop: "var(--space-2xl)" }}>
        <h2 style={{ marginTop: 0 }}>Step 3 — Verify the install</h2>
        <p>
          The toolkit ships <code>env-check.sh</code> — a self-test that walks through every
          tool, every script, every Python package, and every reference file the toolkit
          expects. Run it immediately after install:
        </p>
        <pre><code>{`# Local
cd ~/Projects/pentest
./scripts/env-check.sh

# Container (one-shot)
docker run --rm -it secops-toolkit:latest ./scripts/env-check.sh

# Container (interactive — you'll use this pattern for labs)
docker run --rm -it secops-toolkit:latest bash
# inside:
./scripts/env-check.sh`}</code></pre>

        <h3 style={{ fontSize: "1.0625rem" }}>What env-check actually checks</h3>
        <p>The script is divided into nine grouped sections, mirroring how the toolkit thinks about capabilities:</p>

        <ol>
          <li>
            <strong>Required core tools</strong> — nmap, curl, dig, openssl, jq, python3, git,
            whois. If any of these are missing, half the toolkit won&apos;t work. Local
            install should always pass this section.
          </li>
          <li>
            <strong>Recon &amp; scanning</strong> — subfinder, ffuf, nuclei, gobuster, nikto,
            amass, dnstwist, theHarvester. These are the active-mode workhorses. Optional
            on minimal installs.
          </li>
          <li>
            <strong>Web application</strong> — sqlmap, wpscan, wafw00f, jwt_tool. Specialty
            tools for web testing; missing them is fine until you need them.
          </li>
          <li>
            <strong>OSINT</strong> — trufflehog, gitleaks, mmh3 (Python). Passive recon tools.
          </li>
          <li>
            <strong>Network forensics</strong> — zeek, tshark, tcpdump. Required for the
            PCAP analysis and IR pipelines.
          </li>
          <li>
            <strong>Container &amp; cloud</strong> — docker / podman, kubectl, awscli, az,
            gcloud, grype, trivy. The big cloud CLIs (az, gcloud) are
            install-on-demand because they&apos;re each hundreds of megabytes.
          </li>
          <li>
            <strong>ICS / OT</strong> — modbus-cli, Zeek ICS analyzers, tshark OT dissectors.
            Only relevant if you do industrial control work.
          </li>
          <li>
            <strong>Exploitation</strong> — msfconsole, msfvenom, msfdb, impacket-*, kerbrute.
            Optional but the Metasploit module (Penlearn Module 05) needs them.
          </li>
          <li>
            <strong>Reporting</strong> — graphviz (<code>dot</code>), sqlite3, uuidgen,
            python-docx, anthropic SDK. The reporting pipeline depends on these.
          </li>
        </ol>

        <p>
          Below the tool sections, <code>env-check.sh</code> verifies <strong>all 41 toolkit
          scripts</strong> are present and that the <strong>5 parsers</strong> in{" "}
          <code>scripts/parsers/</code> are loadable Python modules. Finally it shows a
          summary: green checkmarks for found tools, red X&apos;s for missing required tools,
          yellow for missing optional tools.
        </p>

        <div className="callout callout-warn">
          <h4 style={{ marginTop: 0 }}>What &quot;optional&quot; means</h4>
          <p style={{ marginBottom: 0 }}>
            Yellow (optional missing) is not always benign. <code>msfconsole</code> is
            optional from the toolkit&apos;s perspective, but if you&apos;re working
            Module 05 of Penlearn, it&apos;s required <em>for that module</em>. Read the
            lesson&apos;s &quot;Action items&quot; before declaring your install
            sufficient.
          </p>
        </div>
      </section>

      {/* ───────── STEP 4 ───────── */}
      <section style={{ marginTop: "var(--space-2xl)" }}>
        <h2 style={{ marginTop: 0 }}>Step 4 — Attach the container to a lab</h2>
        <p>
          Penlearn labs follow a deliberate pattern: <strong>the lab stands up the
          vulnerable targets; the toolkit container attaches as a separate container</strong>.
          The lab compose file never includes the toolkit. This keeps the lab definitions
          reusable across toolkit versions, and it means the toolkit container can be
          rebuilt without disturbing your in-progress lab work.
        </p>
        <p>The pattern looks like this:</p>
        <pre><code>{`# 1. Start the lab — it creates a private docker network and the vulnerable targets
cd ~/Projects/Penlearn/labs/03-scan-lab
docker compose up -d

# 2. The lab's compose file declared a network — find its name
docker network ls | grep penlearn
# Output:  penlearn-scan_scan        bridge    local

# 3. Run the toolkit container, ATTACHED to that network
docker run --rm -it \\
  --network penlearn-scan_scan \\
  --cap-add NET_RAW \\
  -v "$PWD/work:/work" \\
  -w /work \\
  secops-toolkit:latest bash

# 4. Inside the toolkit container — scripts are on PATH
./scripts/env-check.sh
./scripts/engagement-init.sh scan-practice --type infra
./scripts/pentest.sh target.scan.local 10.60.0.0/24`}</code></pre>

        <h3 style={{ fontSize: "1.0625rem" }}>Why this pattern</h3>
        <ul>
          <li>
            <strong>Lab networks are <code>internal: true</code>.</strong> Vulnerable targets
            cannot reach the internet, and the internet cannot reach them. Only containers
            attached to the same docker network can see them. This is the entire reason the
            toolkit container exists — to be the attacker on that isolated network.
          </li>
          <li>
            <strong>The toolkit container is ephemeral (<code>--rm</code>).</strong> When
            you exit, the container is destroyed. Your work survives because it&apos;s
            volume-mounted to your host (the <code>-v $PWD/work:/work</code> flag).
          </li>
          <li>
            <strong><code>--cap-add NET_RAW</code></strong> is needed for nmap&apos;s
            packet-crafting modes (SYN scan, OS detection). Without it, nmap falls back to
            connect scans, which work but are slower and less informative.
          </li>
        </ul>
      </section>

      {/* ───────── VOLUME MOUNTS ───────── */}
      <section style={{ marginTop: "var(--space-2xl)" }}>
        <h2 style={{ marginTop: 0 }}>Volume mounts — where your work goes</h2>
        <p>
          The toolkit&apos;s scripts route output to three engagement-type directories. If
          you don&apos;t mount these from your host, all output dies with the container.
        </p>
        <pre><code>{`docker run --rm -it \\
  --cap-add NET_RAW \\
  -v ~/assessments:/root/assessments \\
  -v ~/incidents:/root/incidents \\
  -v ~/hunts:/root/hunts \\
  secops-toolkit:latest`}</code></pre>

        <table style={{ marginTop: "var(--space-md)" }}>
          <thead><tr><th>Mount</th><th>What goes here</th><th>Triggered by</th></tr></thead>
          <tbody>
            <tr>
              <td><code>~/assessments</code></td>
              <td>Pentest / red-team engagement output</td>
              <td><code>--engagement &lt;name&gt;</code> on most scripts</td>
            </tr>
            <tr>
              <td><code>~/incidents</code></td>
              <td>IR incident artifacts, evidence bundles, timelines</td>
              <td><code>--incident-id &lt;id&gt;</code> on IR scripts</td>
            </tr>
            <tr>
              <td><code>~/hunts</code></td>
              <td>Threat hunt operations: hypotheses, logs, findings</td>
              <td>Hunt-mode scripts (less common)</td>
            </tr>
          </tbody>
        </table>

        <p>
          Each directory follows a fixed sub-structure (CLAUDE.md §7). The toolkit&apos;s
          <code> engagement-init.sh</code> scaffolds the layout; every other script reads
          and writes to the conventional sub-paths within it. This is why you mount the
          parent dir — the scripts handle the rest.
        </p>

        <div className="callout callout-info">
          <h4 style={{ marginTop: 0 }}>Practical tip</h4>
          <p style={{ marginBottom: 0 }}>
            On Windows / WSL2, mounting <code>~/assessments</code> from WSL means your
            engagement output lives on the WSL filesystem (<code>/home/&lt;user&gt;/...</code>),
            not the Windows side. That&apos;s faster — WSL2&apos;s 9P protocol makes
            Windows-side mounts slow. If you need the files in Windows for reporting (e.g.,
            opening the generated <code>.docx</code> in Word), copy them across via{" "}
            <code>\\\\wsl$\\&lt;distro&gt;\\home\\&lt;user&gt;\\assessments\\...</code>.
          </p>
        </div>
      </section>

      {/* ───────── WHAT'S IN THE CONTAINER ───────── */}
      <section style={{ marginTop: "var(--space-2xl)" }}>
        <h2 style={{ marginTop: 0 }}>What&apos;s in the container — and why</h2>
        <p>
          The Dockerfile is a multi-stage build. Stage 1 (Alpine) compiles Go tools as
          static binaries. Stage 2 (Kali Rolling) is the base image where everything lands.
          The split matters because Go binaries compiled against Alpine&apos;s musl libc are
          smaller and copy cleanly between stages; Kali ships almost everything else the
          toolkit needs out of the box.
        </p>

        <h3 style={{ fontSize: "1.0625rem" }}>Core scanning &amp; recon</h3>
        <p>
          <strong>nmap</strong> is the foundation — every active engagement starts with a
          scan. <strong>ncat</strong> is the swiss-army network utility (banner grabs,
          quick tunnels). <strong>curl</strong> + <strong>jq</strong> handle every REST API
          interaction. <strong>dnsutils</strong> gives you <code>dig</code> for DNS recon,
          which the toolkit&apos;s subdomain enumeration heavily uses. <strong>openssl</strong>
          for TLS inspection. <strong>whois</strong> for WHOIS / RDAP lookups.
        </p>

        <h3 style={{ fontSize: "1.0625rem" }}>Go-compiled tools (the modern recon stack)</h3>
        <p>
          <strong>subfinder</strong> (Project Discovery) does passive subdomain enumeration
          across ~20 sources. <strong>ffuf</strong> is the fast fuzzer — content discovery,
          parameter discovery, vhost discovery. <strong>nuclei</strong> runs ~5000 community
          templates for known vulnerabilities; the toolkit&apos;s <code>web-fuzzer.sh</code>
          chains it. <strong>trufflehog</strong> and <strong>gitleaks</strong> both find
          secrets in git repos — they overlap, but their detection patterns are different
          enough that running both catches more.
        </p>

        <h3 style={{ fontSize: "1.0625rem" }}>Web testing</h3>
        <p>
          <strong>gobuster</strong> and <strong>nikto</strong> are the classics — gobuster
          for directory/file brute-forcing, nikto for known-bad-server-config detection.
          <strong> wpscan</strong> for WordPress-specific testing. The toolkit&apos;s
          <code> webapp-scanner.sh</code> orchestrates them.
        </p>

        <h3 style={{ fontSize: "1.0625rem" }}>Network forensics &amp; IR</h3>
        <p>
          <strong>zeek</strong> is the protocol analyzer — it parses every TCP/UDP session
          into structured logs (conn.log, dns.log, http.log, ssl.log, files.log). The
          toolkit&apos;s <code>pcap-analysis.sh</code> drives Zeek to extract IOCs from
          captured traffic. <strong>tshark</strong> (Wireshark&apos;s CLI) for packet-level
          inspection. <strong>tcpdump</strong> for raw capture.
        </p>

        <h3 style={{ fontSize: "1.0625rem" }}>Active Directory</h3>
        <p>
          <strong>impacket</strong> is a suite of Python AD primitives: GetUserSPNs (for
          Kerberoasting), GetNPUsers (for AS-REP roasting), secretsdump, rbcd, smbexec,
          psexec, and many more. The toolkit&apos;s AD enumeration scripts (<code>bloodhound-import.sh</code>,
          <code> bloodhound-query.sh</code>) use impacket alongside bloodhound-python for
          attack-graph collection. <strong>enum4linux</strong>, <strong>smbclient</strong>,
          <strong> nbtscan</strong> for SMB enumeration.
        </p>

        <h3 style={{ fontSize: "1.0625rem" }}>OSINT &amp; brand protection</h3>
        <p>
          <strong>theHarvester</strong> aggregates email + subdomain data from search
          engines and breach databases. <strong>amass</strong> is the heavy-duty subdomain
          tool when subfinder isn&apos;t enough. <strong>dnstwist</strong> generates
          typosquat permutations of a domain (used by <code>phish-infra-check.sh</code>).
          <strong> mmh3</strong> (Python) computes the favicon hash Shodan indexes for
          infrastructure clustering. <strong>wafw00f</strong> detects + fingerprints WAFs.
        </p>

        <h3 style={{ fontSize: "1.0625rem" }}>Reporting</h3>
        <p>
          <strong>python-docx</strong> drives the toolkit&apos;s DOCX deliverable generator.
          <strong> graphviz</strong> (<code>dot</code> binary) renders network topology
          diagrams. <strong>sqlite3</strong> is the storage layer for <code>scan-db.py</code>,
          the cross-engagement findings database. The optional{" "}
          <strong>anthropic</strong> SDK lets <code>report-generator.py --summarize</code>
          ask Claude to write the executive summary (with prompt-caching so re-runs don&apos;t
          re-bill).
        </p>
      </section>

      {/* ───────── WHAT'S NOT ───────── */}
      <section style={{ marginTop: "var(--space-2xl)" }}>
        <h2 style={{ marginTop: 0 }}>What&apos;s NOT in the container — and why</h2>
        <p>
          Some tools are deliberately excluded. Knowing what&apos;s missing and the reason
          tells you when you need to install something on the host or in a sibling
          container.
        </p>
        <table>
          <thead><tr><th>Tool</th><th>Why excluded</th><th>Mitigation</th></tr></thead>
          <tbody>
            <tr>
              <td><code>docker</code> / <code>podman</code></td>
              <td>Can&apos;t run container engines inside a container reliably (Docker-in-Docker has security and resource implications)</td>
              <td>Run on host; if you need to manage containers from inside the toolkit, mount the docker socket: <code>-v /var/run/docker.sock:/var/run/docker.sock</code></td>
            </tr>
            <tr>
              <td><code>msfconsole</code> / <code>msfvenom</code></td>
              <td>Metasploit is ~3 GB; bundling it would double the image. Most users already have it on the host</td>
              <td>Install in the container with <code>apt install metasploit-framework</code>, or run msf on the host and use the toolkit only for RC generation</td>
            </tr>
            <tr>
              <td><code>avml</code></td>
              <td>Memory acquisition needs host kernel access; doesn&apos;t work from inside a container at all</td>
              <td>Install on the host, or use it on the target Linux system directly</td>
            </tr>
            <tr>
              <td>OWASP ZAP</td>
              <td>~1 GB Java app; UI-driven; doesn&apos;t fit a CLI-first toolkit</td>
              <td>Run separately as a desktop app. The toolkit&apos;s <code>parsers/zap.py</code> can ingest ZAP&apos;s JSON output</td>
            </tr>
            <tr>
              <td><code>az</code> (Azure CLI), <code>gcloud</code></td>
              <td>Each is hundreds of megabytes; not everyone does cloud work</td>
              <td>Install on demand: <code>curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash</code> for az; <a href="https://cloud.google.com/sdk/docs/install" style={{ color: "var(--color-accent-1)" }}>SDK installer</a> for gcloud</td>
            </tr>
            <tr>
              <td>cloudfox / prowler / pacu / roadrecon / scoutsuite</td>
              <td>Specialized cloud-attack tools; not all users need any of them</td>
              <td>Install on demand via pip when starting a cloud engagement</td>
            </tr>
            <tr>
              <td>Neo4j server</td>
              <td>BloodHound&apos;s graph DB is a separate service with its own resource footprint</td>
              <td>Run as a sibling container: <code>{`docker run -d -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/bloodhound neo4j:5-community`}</code></td>
            </tr>
            <tr>
              <td>kube-hunter / kdigger / kube-bench</td>
              <td>Optional K8s tools; not needed without active K8s work</td>
              <td>Install on demand when scaffolding a K8s engagement</td>
            </tr>
            <tr>
              <td>Jailbroken iOS / rooted Android</td>
              <td>Mobile testing needs real or emulated devices outside any container</td>
              <td>Out of scope for the container; mobile labs require host-side setup</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ───────── PLATFORM ───────── */}
      <section style={{ marginTop: "var(--space-2xl)" }}>
        <h2 style={{ marginTop: 0 }}>Platform notes</h2>
        <p>
          The toolkit container is pinned to <code>--platform=linux/amd64</code> on every
          stage, which means it runs the same way on every host — but the performance
          characteristics differ.
        </p>
        <table>
          <thead><tr><th>Platform</th><th>Support</th><th>What to expect</th></tr></thead>
          <tbody>
            <tr>
              <td>Linux (x86_64)</td>
              <td>Native</td>
              <td>Fastest. No emulation overhead. Use Docker or Podman.</td>
            </tr>
            <tr>
              <td>macOS Intel</td>
              <td>Full</td>
              <td>Docker Desktop handles the lightweight Linux VM transparently. Performance close to native.</td>
            </tr>
            <tr>
              <td>macOS Apple Silicon (M1-M4)</td>
              <td>Functional via Rosetta/QEMU</td>
              <td>Container runs in x86 emulation. Functional, but Go compiles during build are noticeably slower; nuclei scans take longer.</td>
            </tr>
            <tr>
              <td>Windows / WSL2</td>
              <td>Full</td>
              <td>Use Docker Desktop with WSL2 backend, or Podman Desktop. Mount volumes from the WSL filesystem, not the Windows side, for speed.</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ───────── TROUBLESHOOTING ───────── */}
      <section style={{ marginTop: "var(--space-2xl)" }}>
        <h2 style={{ marginTop: 0 }}>Troubleshooting — common gotchas</h2>

        <h3 style={{ fontSize: "1.0625rem" }}>nmap returns &quot;You requested a scan type which requires root privileges&quot;</h3>
        <p>
          Inside the container, you need <code>--cap-add NET_RAW</code> for SYN scan / OS
          detection. Without it, nmap can still do TCP connect scans (<code>-sT</code>),
          but you lose stealth and speed. Always pass <code>--cap-add NET_RAW</code>{" "}
          when running the toolkit container.
        </p>

        <h3 style={{ fontSize: "1.0625rem" }}>Lab targets aren&apos;t reachable from the toolkit container</h3>
        <p>
          The toolkit container must be attached to the lab&apos;s docker network. Run{" "}
          <code>docker network ls</code> to confirm the network exists (named like{" "}
          <code>penlearn-&lt;lab&gt;_&lt;netname&gt;</code>), then pass{" "}
          <code>--network &lt;name&gt;</code> when launching the toolkit. The lab&apos;s
          README always names the network in the &quot;Run the toolkit&quot; section.
        </p>

        <h3 style={{ fontSize: "1.0625rem" }}>Output directories aren&apos;t persisting</h3>
        <p>
          You forgot the volume mounts. Without <code>-v ~/assessments:/root/assessments</code>
          {" "}(and the incident / hunt equivalents), every engagement scaffold lives only
          inside the container and dies with it. Make the volume mounts part of your default
          run command via a shell alias:
        </p>
        <pre><code>{`# ~/.bashrc on the host
alias toolkit='docker run --rm -it \\
  --cap-add NET_RAW \\
  -v ~/assessments:/root/assessments \\
  -v ~/incidents:/root/incidents \\
  -v ~/hunts:/root/hunts \\
  secops-toolkit:latest bash'`}</code></pre>

        <h3 style={{ fontSize: "1.0625rem" }}>env-check.sh shows the script inventory but flags one as MISSING</h3>
        <p>
          Usually means you cloned an older tag/commit and a script was added in main since.
          Either <code>git pull</code> to get the latest scripts, or accept the missing one
          if you&apos;re intentionally pinned to a version. Penlearn&apos;s curriculum
          references scripts by name; if the script you need is missing, the lesson&apos;s
          action items will fail — that&apos;s the signal to update.
        </p>

        <h3 style={{ fontSize: "1.0625rem" }}>Metasploit handler shows &quot;Sending stage&quot; but no session catches</h3>
        <p>
          Docker bridge networks sometimes have MTU mismatches that fragment large stage 2
          payloads. Workarounds: use stageless meterpreter (<code>meterpreter_reverse_tcp</code>{" "}
          rather than <code>meterpreter/reverse_tcp</code>), or set{" "}
          <code>EnableStageEncoding false</code> on the handler. See Module 05 lessons for
          context.
        </p>
      </section>

      {/* ───────── WHERE TO NEXT ───────── */}
      <section style={{ marginTop: "var(--space-2xl)" }}>
        <h2 style={{ marginTop: 0 }}>Where to next</h2>
        <p>
          You have the toolkit installed and verified. Three reasonable starting points:
        </p>
        <ol>
          <li>
            <strong>If you&apos;re new to the toolkit&apos;s workflow:</strong>{" "}
            <Link href="/modules/foundations/engagement-workflow" style={{ color: "var(--color-accent-1)", textDecoration: "underline", textUnderlineOffset: 4 }}>
              Foundations Lesson 03 — Engagement Workflow
            </Link>{" "}
            walks through <code>engagement-init.sh</code> and the directory conventions.
          </li>
          <li>
            <strong>If you&apos;re going straight to offense:</strong>{" "}
            <Link href="/modules/passive-recon" style={{ color: "var(--color-accent-1)", textDecoration: "underline", textUnderlineOffset: 4 }}>
              Module 02 — Passive Reconnaissance
            </Link>{" "}
            starts with <code>osint-passive.sh</code> and the OSINT bundle.
          </li>
          <li>
            <strong>If you&apos;re going straight to defense:</strong>{" "}
            <Link href="/modules/soc-hunt" style={{ color: "var(--color-accent-1)", textDecoration: "underline", textUnderlineOffset: 4 }}>
              Module 08 — SOC Detection &amp; Hunt
            </Link>{" "}
            and{" "}
            <Link href="/modules/ir-core" style={{ color: "var(--color-accent-1)", textDecoration: "underline", textUnderlineOffset: 4 }}>
              Module 09 — IR Core
            </Link>{" "}
            cover the detection-through-eradication lifecycle.
          </li>
        </ol>
      </section>

      <nav style={{ marginTop: "var(--space-3xl)", display: "flex", gap: "var(--space-md)", flexWrap: "wrap" }}>
        <Link className="btn btn-primary" href="/labs">Go to lab catalog →</Link>
        <Link className="btn btn-secondary" href="/modules">Browse curriculum</Link>
        <a className="btn btn-ghost" href={REPO_WEB}>Toolkit on GitHub ↗</a>
      </nav>
    </div>
  );
}
