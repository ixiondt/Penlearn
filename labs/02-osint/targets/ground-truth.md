# Ground truth — acme-fake.local

Do not read until after you have run osint-passive.sh and noted what it found.

## Domain

- Registered (in the lab's zone files): 2022-09-14
- Registrant org: Acme Fake Industries (placeholder)
- Tech contact: secops@acme-fake.local

## Subdomains (full list)

- `www.acme-fake.local`            → 10.50.0.20
- `api.acme-fake.local`            → 10.50.0.21 (no service running — passive resolution only)
- `vpn.acme-fake.local`            → 10.50.0.22 (no service running)
- `staging.acme-fake.local`        → 10.50.0.23 (no service running)
- `dev-internal.acme-fake.local`   → 10.50.0.24 (no service running)
- `mail.acme-fake.local`           → 10.50.0.25 (MX record)
- `acme-fake.local`                → 10.50.0.20

`staging.acme-fake.local` and `dev-internal.acme-fake.local` should appear in CT logs
even though no service runs there — they're the "embarrassing" subdomains that show up
because someone issued certs for them once.

## Email addresses (in seeded data)

- secops@acme-fake.local        (tech contact, WHOIS)
- admin@acme-fake.local         (in TXT records — "spf admin" stale entry)
- support@acme-fake.local       (mentioned in the seeded www homepage)

## ASN

- Pretend ASN: AS65530 (private)
- Prefix: 10.50.0.0/24

## Tech stack signals on www

- `Server: nginx/1.27` (header)
- A meta tag claiming "Powered by Acme CMS"
- A favicon with a deliberate distinct hash

## What the lesson expects you to find

1. All 7 subdomain entries (via CT log seed)
2. The 3 email addresses (via theHarvester seed + WHOIS)
3. nginx + Acme CMS tech stack
4. ASN AS65530 + 10.50.0.0/24 prefix
5. Favicon hash + Shodan URL format

## What's deliberately hidden

- `historian.acme-fake.local` — exists in zone but no cert was ever issued, so CT
  won't find it. Only DNS brute-force (active) would surface it. The lesson uses
  this to make the point: passive recon has a coverage ceiling.
