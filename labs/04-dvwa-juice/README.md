# Lab 04 — Web App (DVWA + Juice Shop)

**Module**: 04 — Web Application Testing  
**Isolation**: fully internal  
**Time**: 90-180 minutes (depending on depth)

## Targets

| Host                 | IP          | What it is                    |
|----------------------|-------------|------------------------------|
| `dvwa.web.local`     | 10.70.0.10  | DVWA — classic intentional vulns by class |
| `juice.web.local`    | 10.70.0.11  | OWASP Juice Shop — modern stack, gamified |
| `api.web.local`      | 10.70.0.12  | Small JSON API w/ IDOR/JWT/SSRF flaws    |

## Setup

```bash
docker compose up -d
docker compose ps
```

## Run the toolkit

```bash
docker run --rm -it \
  --network penlearn-webapp_web \
  -v "$PWD/work:/work" \
  -w /work \
  secops-toolkit bash

# Quick assessment
./scripts/webapp-scanner.sh http://dvwa.web.local --engagement webapp-lab
./scripts/webapp-scanner.sh http://juice.web.local --engagement webapp-lab --full

# Targeted fuzzing
./scripts/web-fuzzer.sh http://api.web.local --api-discovery
```

## Exercises (work in this order — each builds on the last)

### Exercise 1 — Content discovery

Run `webapp-scanner.sh` against all three targets. What endpoints did it find on
each? Which findings are real vs. low-confidence (look at the severity tags)?

### Exercise 2 — SQLi class (DVWA)

In DVWA, set difficulty to "low" and walk through the SQLi page. Confirm SQLi
manually first, then run `sqlmap -u "<url>" --batch`. Compare. When does manual
beat sqlmap? When does sqlmap beat manual?

Move to "medium" difficulty. Does sqlmap still work? Why or why not?

### Exercise 3 — Auth attacks (Juice Shop)

Juice Shop uses JWT for session auth. Capture a JWT, decode it (`jwt_tool` if
available, or just base64), inspect the header and payload. What signing algorithm?
Can you forge a token with `alg:none`? With `alg:HS256` if the secret is weak?

Reference: `data/references/auth-attack-checklist.md` in the toolkit.

### Exercise 4 — IDOR (vuln-api)

The API exposes `/api/users/<id>`. Authenticate as user 1. Can you read user 2?
What about user 0 or user -1? What does the response leak?

Generate a finding entry in the engagement workspace.

### Exercise 5 — SSRF (vuln-api)

The API has an endpoint like `/api/preview?url=<X>`. What protections (if any)
are in place? Try:

- `http://10.70.0.10/` (DVWA — internal target)
- `http://localhost:80/`
- `http://169.254.169.254/latest/meta-data/` (cloud metadata, will time out in lab)
- `file:///etc/passwd`
- `gopher://10.70.0.10:25/<smtp payload>`

Document which work, which are blocked, and how.

### Exercise 6 — Findings → report

```bash
# Build findings JSON (manually edit or use --to-db output from sqlmap parsers)
python3 scripts/risk-scoring.py --findings findings.json --output scored.json
python3 scripts/report-generator.py --findings scored.json --output webapp-report.docx
```

## Success criteria

- [ ] At least one finding in each OWASP category you tested (A03, A05, A07, A10)
- [ ] One forged JWT that the app accepts
- [ ] One confirmed IDOR with a sample request/response
- [ ] One confirmed SSRF + the bypass technique used
- [ ] Generated DOCX with at least 5 findings

## Tear down

```bash
docker compose down -v
```

## Going further

The `data/references/` checklists in the toolkit cover testing techniques in
depth. Treat this lab as the first 25% — the full webapp-attack-checklist has
20+ classes you can keep practicing.
