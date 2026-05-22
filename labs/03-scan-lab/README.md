# Lab 03 — Active Scan

**Module**: 03 — Active Scanning & Enumeration  
**Lesson**: Nmap Workflow & pentest.sh Pipeline  
**Isolation**: fully internal (no host egress)  
**Time**: 60-90 minutes

## What you'll practice

- The full `pentest.sh` → `cve-lookup.sh` → `risk-scoring.py` → `msf-rc-gen.sh`
  → `report-generator.py` pipeline
- Reading nmap output and matching to known-bad version detection
- Per-service enumeration (SMB, SNMP, FTP)
- Using `scan-db.py` to persist results

## Targets

| Host                  | IP          | Service               | Vuln class to find        |
|-----------------------|-------------|----------------------|---------------------------|
| `ftp.scan.local`      | 10.60.0.10  | vsftpd               | Anonymous access, banner  |
| `ssh.scan.local`      | 10.60.0.11  | OpenSSH 7.4          | Old version, weak ciphers |
| `web.scan.local`      | 10.60.0.12  | Apache 2.4.49        | Known CVE in banner       |
| `smb.scan.local`      | 10.60.0.13  | Samba public share   | Null/guest enumeration    |
| `snmp.scan.local`     | 10.60.0.14  | snmpd                | Community brute / walk    |

## Setup

```bash
docker compose up -d
docker compose ps  # verify all 5 healthy
```

## Run the pipeline

```bash
# Attach toolkit container to the lab network
docker run --rm -it \
  --network penlearn-scan_scan \
  -v "$PWD/work:/work" \
  -w /work \
  secops-toolkit bash

# Inside the toolkit:
./scripts/engagement-init.sh scan-practice --type infra

# Sweep — note this is the SUBNET, not a single host
./scripts/pentest.sh scan.local 10.60.0.0/24

# Output lands in /work/pentest-reports/<timestamp>/
ls /work/pentest-reports/*/

# CVE lookup
./scripts/cve-lookup.sh \
  --nmap-file /work/pentest-reports/*/02-nmap-realip.txt \
  --output /work/findings.json \
  --engagement scan-practice

# Risk scoring
python3 scripts/risk-scoring.py \
  --findings /work/findings.json \
  --output /work/scored.json

# Persist
python3 scripts/scan-db.py import-findings \
  --findings /work/scored.json \
  --engagement scan-practice

# Inspect
python3 scripts/scan-db.py query \
  --engagement scan-practice --severity HIGH
```

## Exercises

### Exercise 1 — Manual enumeration vs. automated

Before running `pentest.sh`, do an initial nmap by hand:

```bash
nmap -sV -p- 10.60.0.0/24 -oN initial.txt
```

Compare your `initial.txt` to `pentest-reports/*/02-nmap-realip.txt`. What did
`pentest.sh` add (NSE scripts, vuln scan, follow-up SMB/SMTP/SNMP enumeration)
that you missed?

### Exercise 2 — Known-bad version detection

`pentest.sh` Section 14 runs the known-bad version table against the banner output.
Find which targets fired which patterns. For each fired pattern, confirm against
the actual service whether it's a true positive or a banner-string false match.

### Exercise 3 — Per-service enumeration

For each service:

- **FTP**: `nmap --script=ftp-anon,ftp-bounce,ftp-syst -p 21 10.60.0.10`
- **SSH**: confirm version, list ciphers (`ssh-audit` if installed)
- **SMB**: `enum4linux -a 10.60.0.13`
- **SNMP**: `onesixtyone -c data/wordlists/snmp.txt 10.60.0.14`, then `snmpwalk -c public -v2c 10.60.0.14`

Record findings under `03-enumeration/` per the toolkit convention.

### Exercise 4 — Reporting

```bash
python3 scripts/report-generator.py \
  --findings /work/scored.json \
  --output /work/scan-practice-report.docx \
  --summarize  # uses Claude API if ANTHROPIC_API_KEY is set, otherwise template
```

Open the .docx and read the AI-generated summary. Is it accurate? What did it
overstate, understate, or miss?

## Success criteria

- [ ] All 5 services identified by nmap
- [ ] At least 3 HIGH-severity findings in the scored output
- [ ] enum4linux returned a share listing for `\\smb.scan.local\public`
- [ ] snmpwalk returned at least the sysDescr OID
- [ ] Scan results persisted to scan-db and queryable by severity
- [ ] DOCX report generated

## Tear down

```bash
exit
docker compose down -v
```
