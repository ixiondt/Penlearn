# Penlearn Labs — Bring Your Own Environment

Every lab here runs on **your** machine. Penlearn never hosts vulnerable targets or
offensive tooling on shared infrastructure. The cost calculus is simple: per-user
ephemeral VMs are expensive, and exposing offensive tooling on the open internet is a
legal and operational liability. So you do it locally.

## Prerequisites

- `docker` (or `podman`) with `compose` v2+
- The SecOps toolkit cloned from [github.com/ixiondt/Pentest](https://github.com/ixiondt/Pentest)
  with `install.sh local` or `install.sh container` completed — see the
  [Install guide](../src/app/install/page.tsx) on the Penlearn site for full walkthrough
- A dedicated lab machine, a VM, or WSL2 with the network locked down
- Sufficient RAM (most labs: 6-8 GB; AD lab: 32 GB recommended)

## Isolation rules — read first

1. **Private docker networks only.** Lab compose files use `internal: true` bridges or
   bind to `127.0.0.1`. Don't change this.
2. **No port-forwards on prod machines.** Run labs on a dedicated lab host or VM.
3. **Tear down between sessions.** `docker compose down -v` releases volumes and networks.
4. **Never point active tools at someone else's target.** The toolkit's standing rule §1
   (authorization) is enforced by you, not by the lab.

## Catalog

| ID                | Title                                | Module |
|-------------------|--------------------------------------|--------|
| `01-workspace`    | Workspace scaffold                   | 01 — Foundations |
| `02-osint`        | Passive OSINT lab                    | 02 — Passive Recon |
| `03-scan-lab`     | Active scan lab                      | 03 — Active Recon |
| `04-dvwa-juice`   | Web app lab (DVWA + Juice Shop)      | 04 — Web Application |
| `05-adlab`        | Active Directory lab (Vagrant)       | 06 — AD Attacks |
| `06-msf-lab`      | Metasploit practice (full chain + pivot) | 05 — Metasploit |
| `07-sigma-lab`    | Sigma rule authoring lab             | 08 — SOC & Hunt |
| `08-ir-lab`       | IR practice lab                      | 09 — IR Core |

Each lab directory contains:

- `docker-compose.yml` (or `Vagrantfile`) — the targets
- `README.md` — what to do in the lab
- `targets/` — any seed data, configs, or scripts the targets need
- `solutions/` — hidden by default; the reference walkthrough

## Quick start

```bash
# Pick a lab
cd labs/02-osint

# Read the README
cat README.md

# Stand it up
docker compose up -d

# Run the lesson's commands against it
docker run --rm -it --network penlearn-osint \
  -v "$PWD/work:/work" -w /work \
  secops-toolkit ./scripts/osint-passive.sh acme-fake.local

# Tear it down
docker compose down -v
```

## Adding new labs

A lab directory looks like:

```text
labs/<id>/
├── README.md             # What the lab does, what to attack, success criteria
├── docker-compose.yml    # Targets only — never the toolkit
├── targets/              # Any seed data
└── solutions/            # Hidden walkthrough (gitignore'd until learner asks for it)
```

Constraints:

- The toolkit is **never** in the compose file — it runs from a separate container
  attached to the lab network with `--network <lab-network>`. Keeps the lab definitions
  reusable.
- All target networks declared `internal: true` or bind explicitly to `127.0.0.1`.
- Resource limits set on every container (`mem_limit: 1g`, `cpus: '1.0'`).
- Targets pinned to specific image tags. Never `:latest`.

When you add a lab, update `labs/README.md` (this file) and `src/content/curriculum.ts`
in the main site so the lab card renders.
