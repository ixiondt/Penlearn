# Lab 07 — Sigma Rule Authoring

**Module**: 07 — SOC Detection & Hunt Hypotheses  
**Lesson**: Authoring Sigma Rules  
**Isolation**: bound to 127.0.0.1 (Dashboards UI only)  
**Time**: 60-90 minutes

## What you'll practice

- Generating Sigma rules from ATT&CK technique IDs via `sigma-rule-builder.sh`
- Converting Sigma to OpenSearch query DSL (`sigma2es` or manual translation)
- Backtesting against seeded logs to measure false-positive rate
- Tuning rules to reach an acceptable signal-to-noise ratio

## Setup

```bash
docker compose up -d
# Wait ~60s for OpenSearch to come up; the seeder fires once and exits
docker compose logs penlearn-sigma-seeder

# Confirm indices loaded
curl -s "http://localhost:9200/_cat/indices?v" --resolve "localhost:9200:127.0.0.1"
# Expected: penlearn-windows-* and penlearn-linux-*

# Open Dashboards
open http://localhost:5601    # macOS
# or: start http://localhost:5601    (Windows)
```

## Seeded indices

| Index                  | What's in it                                             |
|------------------------|----------------------------------------------------------|
| `penlearn-windows-4688`| ~3000 process creation events, 12 malicious mixed in     |
| `penlearn-windows-4663`| LSASS handle accesses, with one Mimikatz-shaped event    |
| `penlearn-windows-7045`| Service installs, including an unsigned ImagePath one    |
| `penlearn-windows-4625`| Failed logins — includes a password-spray burst          |
| `penlearn-linux-audit` | execve events, including bash history-clear and SUID set |
| `penlearn-azure-signin`| AiTM-shaped sign-ins — datacenter ASN, token replay      |

## Exercises

### Exercise 1 — Generate a rule for T1059.001

```bash
# In a toolkit container attached to the network (or local)
./scripts/sigma-rule-builder.sh --technique T1059.001 --incident-id sigma-lab
```

Open the generated rule. Read every `NOTE:` and fill them in for this lab:

- Domain regex: irrelevant for this lab (no AD logs), comment out
- VPN egress ASN allowlist: irrelevant
- Service account naming: any `NT AUTHORITY\\*`

### Exercise 2 — Convert to OpenSearch DSL

If you have `sigma` CLI installed:

```bash
sigma convert -t opensearch_lucene rule.yml
```

Otherwise translate by hand. Sigma's `selection`/`condition` maps directly to
`bool: { must: [...], must_not: [...] }`.

### Exercise 3 — Backtest

Run the query against `penlearn-windows-4688`. How many hits?

- If <5: the rule may be too tight; loosen one filter and re-run
- If >20: the rule is too loose; tighten or add filters
- 5-20 is usually the right starting band

### Exercise 4 — Compare TP/FP

The lab pre-labels malicious events with `_meta.malicious: true`. After backtest:

```text
TP = your_hits ∩ malicious_in_index
FP = your_hits − malicious_in_index
FN = malicious_in_index − your_hits
```

Calculate precision and recall. A useful rule has both. A rule with high recall
and low precision will be ignored in production.

### Exercise 5 — Tune

Pick the largest FP category and add a `filter:` that excludes it. Re-run the
calculation. Document what you changed and why in the rule's `falsepositives:` field.

### Exercise 6 — Multi-technique chain

Generate rules for T1539, T1078.004, and T1556.006 (the AiTM cluster). Run all
three against `penlearn-azure-signin`. The lab seeds a coherent AiTM attack chain
across these events — verify that hitting all three on the same user identity in
a short window is the high-priority detection signal called out in the toolkit
hypotheses H-059 → H-064.

## Success criteria

- [ ] T1059.001 rule reaches >0.7 precision and >0.7 recall on the seed data
- [ ] You can articulate what each `NOTE:` tunable does
- [ ] AiTM rule chain correlates across the three techniques for the seeded attack
- [ ] At least one tuned rule has 2+ entries in its `falsepositives:` field

## Tear down

```bash
docker compose down -v   # also removes opensearch-data volume
```
