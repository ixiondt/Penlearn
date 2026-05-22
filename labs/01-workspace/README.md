# Lab 01 — Workspace Scaffold

**Module**: 01 — Foundations  
**Lesson**: Engagement Workflow & File Organization  
**Isolation**: host-only (toolkit container with egress for passive recon)  
**Time**: 20 minutes

## What you'll practice

- Building the SecOps toolkit container locally
- Scaffolding an engagement workspace with `engagement-init.sh`
- Reading the generated `RUNBOOK.md` and `00-MANIFEST.json`
- Registering an engagement with `scan-db.py`

## Setup

```bash
# Clone the toolkit if you haven't already
git clone https://github.com/ixiondt/Pentest.git ../../pentest
cd ../../pentest && ./install.sh container
cd ../Penlearn/labs/01-workspace

# Stand up the workspace
docker compose up -d

# Open a shell inside the toolkit container
docker exec -it penlearn-toolkit bash
```

## Exercises

### Exercise 1 — Scaffold a web engagement

```bash
# Inside the toolkit container
./scripts/engagement-init.sh practice-web --type web
```

Read everything it created:

```bash
tree /engagements/practice-web
cat /engagements/practice-web/RUNBOOK.md
cat /engagements/practice-web/00-MANIFEST.json
```

**Observe**: where the REFS go, what's in 00-MANIFEST.json (toolkit git SHA matters
for reproducibility), what the RUNBOOK lists as the pipeline.

### Exercise 2 — Scaffold an IR engagement

```bash
./scripts/engagement-init.sh INC-2026-001 --type ir
```

It should write to `/incidents/INC-2026-001/`, not `/engagements/`. Note the layout
difference: IR has a `01-timeline.md`, `03-iocs.txt`, `05-containment-log.txt`. Active
recon has `02-active-recon/`, `04-vulnerabilities/`, etc.

### Exercise 3 — Compare engagement types

```bash
./scripts/engagement-init.sh practice-ot --type ot
diff <(ls /engagements/practice-web) <(ls /engagements/practice-ot)
cat /engagements/practice-ot/00-authorization.txt
```

The OT type's authorization template is a three-signatory form (IR Lead + NetO +
Process Engineer). The web type's authorization template is a single-signature scope
document.

### Exercise 4 — Register and query

```bash
# Already registered automatically by engagement-init.sh
python3 scripts/scan-db.py list
python3 scripts/scan-db.py stats
```

You should see all three engagements with their types and timestamps.

## Success criteria

- [ ] Three engagement workspaces exist with the expected per-type layouts
- [ ] `scan-db.py list` shows all three
- [ ] You've read each RUNBOOK.md end-to-end
- [ ] You can articulate why the OT and web auth templates differ

## Tear down

```bash
exit                          # leave the container
docker compose down -v        # stop and remove the lab
rm -rf engagements incidents  # clear the practice data
```
