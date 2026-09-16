# Tabletop — Working the Response Actions Loop

A decision exercise over the compromised host in this lab. It teaches the *shape* of
an incident, not the tooling: you will run the dynamic loop — Scope → Contain →
Eradicate → Recover, repeated until a scope pass comes back empty — against a host
that is deliberately built to punish a single-pass, linear response.

Do the [`ir-models`](../../src/content/lessons/ir-core/ir-models.mdx) lesson first.
For the methodology behind the loop, see the toolkit's `docs/ir-methodology.md`.

> **Spoilers.** This exercise names the seeded artifacts to make its teaching point.
> If you want to discover them cold, run the CTF challenges for this lab first
> (`ir-rogue-account`, `ir-c2-port`), then come back.

---

## The scenario

Recovery monitoring on `compromised-ubuntu` (10.90.0.10) flagged an outbound
connection attempt. SOC has handed it to you as a confirmed true positive:
**HIGH severity, suspected persistent access, single host in scope.** You own the
containment decision. The clock started at detection.

You have the toolkit attached to the lab network and a shell on the host. Work the
loop. At each step, decide *before* you read the next section.

---

## Entry gate — Verify & Triage

```
[ ] TRUE POSITIVE   yes — SOC handoff, outbound connection observed
[ ] SEVERITY        HIGH
[ ] PLAYBOOK        start with PB-010 Persistence (the signal is re-access, not a fresh infection)
[ ] AUTHORITY       you, as IR lead for this exercise
```

Gate passed. Enter the loop.

---

## Iteration 1

**Scope.** Enumerate persistence from scratch. The fast finds:
a rogue user with passwordless sudo (`svcadm`), and a daily cron callback under
`/etc/cron.daily/` reaching a C2 host on a well-known reverse-shell port. You now
have two mechanisms and one C2 address.

**Decision point.** The linear instinct is: disable the account, delete the cron,
recover, done. Write down what that instinct misses before continuing.

**Contain.** Preserve first — the ordering rule has teeth here. Capture volatile
state and image the relevant files *before* you touch anything (`forensics-collect.sh`).
Then contain reversibly: lock the account, isolate the host's network path while
keeping it powered so RAM survives.

**Eradicate.** Remove the account and the cron job across the current scope.

**Recover.** Restore, monitor. And here the host bites: monitoring shows a process
still trying to reach the same C2 address — on a *different* port. Iteration 1's
scope was incomplete. The loop is not closed.

---

## Iteration 2

**Re-scope — do not remember.** Enumerate again, from scratch. This pass turns up
what the first missed: a systemd service masquerading as a system component, an
init.d remnant and an MOTD hook that both relaunch the same helper, a SUID copy of a
shell in `/tmp`, a `setcap` escalation on the Python binary, a PATH-hijack `sudo`
shim in the user's home, and a root `authorized_keys` entry. The "obvious" cron was
the decoy; the real resilience is spread across half a dozen mechanisms.

**Decision point.** Notice what re-scoping bought you. Had you exited after
iteration 1, the systemd service, the init.d hook, and the MOTD hook would each have
relaunched the callback — three separate ways the host reinfects itself on the next
boot.

**Contain / Eradicate.** Remove all of them across this wider scope. Do not reboot
until fully scoped — several of these are boot-triggered and rebooting early both
tips the design and can re-arm what you have not found.

**Recover.** Restore, monitor again. Recovery telemetry is still a scope input.

---

## Iteration 3 — the exit

**Re-scope.** A full pass now finds no new account, no new persistence, no new
channel, and monitoring stays quiet. **That** is the exit condition — not "we
handled the cron," which is where a linear response would have stopped two
iterations ago.

---

## Debrief

- **Timeline.** Reconstruct from the seeded `auth.log` and bash history — initial
  access, escalation, the account creation.
- **Root cause & ATT&CK map.** Map each mechanism to its technique (scheduled task,
  create account, valid-accounts sudo, SSH authorized-keys, capabilities abuse).
- **Lesson into Prepare.** The single-host scope in the SOC handoff was a floor, not
  a ceiling. Every incident of this shape should assume multiple persistence
  mechanisms from the start.

---

## The point of the exercise

Count the passes. A linear response exits after iteration 1 with the host still
owning three ways to call home. The loop exits after iteration 3 because — and only
because — a fresh scope pass came back empty. The tooling was the same either way.
The **shape** of the response is what closed the incident.
