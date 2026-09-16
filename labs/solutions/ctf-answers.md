# CTF answer key — SPOILERS

> **Stop.** This file lists every flag. If you're a learner, close it — recovering
> these yourself is the entire exercise. It exists so the maintainer can reproduce
> and verify the hashes in `src/content/challenges.ts`.

Verify any row with:

```bash
npx tsx scripts/ctf-hash.ts "<answer>"
# compare the printed hex against the challenge's answerHash
```

Answers are matched case-insensitively with whitespace collapsed (see
`normalizeFlag` in `src/lib/ctf.ts`), so the exact casing below is not required
at submit time.

| Challenge id | Lab | Answer | Where it lives |
|---|---|---|---|
| `osint-dns-txt` | 02-osint | `PENLEARN{passive_dns_txt_recon}` | planted — TXT record in `targets/zones/db.acme-fake.local` |
| `osint-web-source` | 02-osint | `PENLEARN{html_source_disclosure}` | planted — HTML comment in `targets/www/index.html` |
| `scan-smb-anon` | 03-scan-lab | `PENLEARN{anonymous_smb_enum}` | planted — `targets/share/README.txt` |
| `scan-apache-cve` | 03-scan-lab | `CVE-2021-41773` | recovered fact — Apache 2.4.49 banner (`httpd:2.4.49-alpine`) |
| `soc-spray-source` | 07-sigma-lab | `185.55.32.10` | recovered fact — spray source IP in `targets/seed-logs.py` (`gen_4625`) |
| `soc-exfil-rule` | 07-sigma-lab | `exfil@attacker.example` | recovered fact — `New-InboxRule` ForwardTo in `gen_azure_signin` |
| `ir-rogue-account` | 08-ir-lab | `svcadm` | recovered fact — rogue sudo user in `targets/setup-compromise.sh` |
| `ir-c2-port` | 08-ir-lab | `4444` | recovered fact — cron reverse-shell port in `setup-compromise.sh` |
| `ai-prompt-leak` | 09-ai-redteam | `ACME-7Q-NEPTUNE-42` | recovered fact — leaked passphrase in `vuln-chat/app.py` system prompt |

**Planted vs recovered.** Planted flags are `PENLEARN{...}` tokens seeded into
Penlearn-owned target files, so recovering one proves the enumeration reached the
data. Recovered facts are deterministic values already present in the lab, so
naming one proves the investigation reached the right place. Both are visible to
anyone reading this repo — that's the same trade-off the labs page already makes
about `solutions/`: the defense is against reading the shipped *website* source,
not against a determined reader of the source tree. The teaching value is in
doing the lab.
