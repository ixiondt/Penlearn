# Lab 02 — Passive OSINT

**Module**: 02 — Passive Reconnaissance  
**Lesson**: OSINT Aggregation  
**Isolation**: fully internal (no host egress)  
**Time**: 30-45 minutes

## What you'll practice

- Running `osint-passive.sh` against a controlled target
- Reading the output bundle in the conventional layout
- Distinguishing what each passive source contributes
- Practicing CT-log analysis, ASN walks, and favicon hashing on data you can verify

The "target" is `acme-fake.local`. Its DNS, WHOIS, and TLS certificates are pre-staged
in the lab. You can confirm what's "true" about it by reading `targets/ground-truth.md`.

## Setup

```bash
docker compose up -d

# Verify the resolver and webserver are up
docker exec penlearn-osint-resolver dig @127.0.0.1 acme-fake.local +short
docker exec penlearn-osint-web curl -s http://localhost/
```

## Run the toolkit against it

Run the toolkit container *attached to the lab network* so its DNS resolves through
the lab resolver:

```bash
docker run --rm -it \
  --network penlearn-osint_osint \
  --dns 10.50.0.10 \
  -v "$PWD/work:/work" \
  -w /work \
  secops-toolkit \
  ./scripts/osint-passive.sh acme-fake.local
```

## Exercises

### Exercise 1 — Output inventory

After osint-passive.sh completes, walk the output:

```bash
ls work/
cat work/summary.md
```

For each file in the output, write one sentence: *what does this file tell me that the
others don't?*

### Exercise 2 — Compare with ground truth

```bash
cat targets/ground-truth.md
```

Which of the "real" facts about acme-fake.local did your passive recon discover?
Which did it miss? Why?

### Exercise 3 — Favicon hash

The webserver serves a deliberately-distinct favicon. Compute its mmh3 hash and write
the Shodan search URL you'd use to find related infra. (In this lab, the URL doesn't
go anywhere — but you should know the format.)

```bash
docker exec penlearn-osint-web cat /usr/share/nginx/html/favicon.ico | python3 -c "
import sys, mmh3, codecs
data = sys.stdin.buffer.read()
b64 = codecs.encode(data, 'base64')
print('Hash:', mmh3.hash(b64))
print('Shodan: https://www.shodan.io/search?query=http.favicon.hash%3A' + str(mmh3.hash(b64)))
"
```

### Exercise 4 — Differential reading

```bash
# Try the same target with only -b crtsh
./scripts/osint-passive.sh acme-fake.local --only crtsh
# vs the full run
./scripts/osint-passive.sh acme-fake.local
```

Note the gap. Which sources were uniquely valuable?

## Success criteria

- [ ] osint-passive.sh runs to completion without errors
- [ ] You can articulate what each output file contributes
- [ ] You found at least 3 facts in ground-truth.md and missed at most 2
- [ ] You produced a valid favicon Shodan URL

## Tear down

```bash
docker compose down -v
```
