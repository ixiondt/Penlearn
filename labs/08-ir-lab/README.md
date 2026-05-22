# Lab 08 — IR Practice

**Module**: 08 — Incident Response Core  
**Lesson**: Forensic Collection + Persistence Audit + Containment  
**Isolation**: fully internal  
**Time**: 90-180 minutes

## What you'll practice

- Volatile-first forensic acquisition with `forensics-collect.sh`
- Enumerating persistence with `persistence-audit.sh` against a *real* compromise
- Reading a chain-of-custody hashed bundle
- Building an incident timeline from collected artifacts

## The story

A SOC alert fired earlier today on the host `compromised-ubuntu`. Initial telemetry
suggests a foothold via a phishing attachment (a malicious shell script invoked via
a desktop launcher), with downstream persistence and C2.

Your task: acquire evidence first, then enumerate the full extent of the compromise.

## What's pre-staged on the host

The setup script (`targets/setup-compromise.sh`) drops several persistence and
post-exploit artifacts. Do **not** read the script before the lab — it spoils
the exercises. The artifacts cover:

- A cron persistence entry
- A systemd service unit
- A new user with sudo privileges
- An SUID binary
- A modified PATH for a user
- Bash history showing the attacker's session
- A capabilities-based escalation primitive
- An IFEO-equivalent technique on Linux (`/etc/sysctl.d/` abuse)
- A scheduled task disguised as a system service

There are ~12 persistence/exploit artifacts in total. The grade is how many you find.

## Setup

```bash
docker compose up -d

# Wait ~30s for the setup script to run
docker compose logs penlearn-ir-ubuntu | tail -n 20
```

## Run the toolkit

```bash
docker run --rm -it \
  --network penlearn-ir_ir \
  -v "$PWD/work:/work" \
  -w /work \
  secops-toolkit bash

# Inside toolkit:
./scripts/engagement-init.sh INC-2026-001 --type ir

# Step 1 — volatile-first acquisition
./scripts/forensics-collect.sh \
  --remote root@10.90.0.10 \
  --incident-id INC-2026-001

# Step 2 — verify the chain-of-custody hashes
cd /incidents/INC-2026-001/07-evidence/
cat CHAIN-OF-CUSTODY.txt
sha256sum -c CHAIN-OF-CUSTODY.txt

# Step 3 — persistence audit
./scripts/persistence-audit.sh \
  --remote root@10.90.0.10 \
  --incident-id INC-2026-001 \
  --os linux

# Step 4 — timeline
python3 scripts/timeline-merge.py \
  --sources /incidents/INC-2026-001/07-evidence/auth.log \
            /incidents/INC-2026-001/07-evidence/syslog \
  --output /incidents/INC-2026-001/01-timeline.md
```

## Exercises

### Exercise 1 — Acquire first, investigate second

Resist the urge to look at the host first. Run `forensics-collect.sh` against
10.90.0.10, then verify hashes, then start your investigation only on the
collected evidence — not on the live host.

### Exercise 2 — Persistence inventory

Find every persistence artifact. Keep a tally. The lab expects you to find
~10-12; the bottom of the score (~5) means you only found the obvious cron entry.

For each artifact, write a one-line ATT&CK mapping in the four-column format:

```text
Persistence → T1053.003 Cron → "/etc/cron.daily/update.sh" runs nc to 1.2.3.4 → /etc/cron.daily
```

### Exercise 3 — Timeline reconstruction

Merge the auth log and syslog into a unified timeline. What's the first
sign of compromise in the timeline? What's the last attacker action?

### Exercise 4 — Containment plan (no execution)

Draft a containment plan. For each persistence artifact, what action would
remove it without destroying additional evidence? In what order?

```bash
# Generate proposed containment commands without executing
./scripts/containment.sh isolate-host --mgmt-ip 10.90.0.10 --incident-id INC-2026-001
# Read the generated script before running anything
```

The lab won't enforce this — but a real incident would. The "review before
--execute" pattern is the discipline.

### Exercise 5 — Detection rule

For the persistence technique you find most interesting, generate a Sigma rule:

```bash
./scripts/sigma-rule-builder.sh --technique <T-number> --incident-id INC-2026-001
```

This is the AAR loop — the incident becomes the next detection.

## Success criteria

- [ ] All forensic artifacts hashed with matching chain-of-custody
- [ ] At least 8 of ~12 persistence artifacts found
- [ ] Each finding has a four-column ATT&CK mapping
- [ ] Timeline.md shows initial access → first persistence → C2 in order
- [ ] At least one Sigma rule generated and reviewed

## Tear down

```bash
exit
docker compose down -v   # also removes the ir-data and evidence volumes
```

## Going further

The lab is single-host Linux. For the Windows side, see `vagrant/Vagrantfile` (work
in progress). Real engagements are usually Windows-heavy — the persistence-audit
script's Windows-mode is where you'd practice Run keys, IFEO debugger, COM hijacking,
ADS, etc.
