# Deploying Penlearn

Penlearn ships as a Node container (Next.js 16 standalone) through
**GitHub Actions → ghcr.io → SSH pull**, served behind the droplet's existing
**Caddy** reverse proxy.

```
push main ─▶ GHA: typecheck + build image ─▶ ghcr.io/ixiondt/penlearn ─▶ SSH ─▶ podman pull + up ─▶ Caddy ─▶ 🌐
```

Files in this repo: `Dockerfile`, `podman-compose.prod.yml`,
`.github/workflows/deploy.yml`, `src/app/api/health/route.ts` (healthcheck).

---

## Values to confirm / fill

| Placeholder | Where | Default | Notes |
|---|---|---|---|
| `penlearn.guardcybersolutionsllc.com` | Caddy block + DNS | — | the public hostname |
| host port | `podman-compose.prod.yml` + Caddy | `3014` | change if 3014 is taken on the droplet |
| app dir | host + workflow `script` | `/opt/apps/penlearn` | matches the toolkit's `/opt/apps/<app>` convention |

---

## One-time setup

### 1. GitHub repo secrets
`Settings → Secrets and variables → Actions → New repository secret`:

| Secret | Value |
|---|---|
| `DEPLOY_HOST` | droplet IP or hostname |
| `DEPLOY_USER` | SSH user that can run `podman` and owns `/opt/apps/penlearn` |
| `DEPLOY_SSH_KEY` | private key for that user (the matching public key is in the droplet's `authorized_keys`) |

No registry PAT needed — the workflow forwards its per-run `GITHUB_TOKEN` to the
host for `login → pull → logout`.

### 2. Droplet: app directory + compose file
```bash
ssh <DEPLOY_USER>@<DEPLOY_HOST>
sudo mkdir -p /opt/apps/penlearn && sudo chown $USER:$USER /opt/apps/penlearn
# copy this repo's podman-compose.prod.yml into it (scp from your machine):
#   scp podman-compose.prod.yml <DEPLOY_USER>@<DEPLOY_HOST>:/opt/apps/penlearn/
podman --version && podman-compose --version   # both must exist
```
The workflow `cd`s into this dir and runs the compose file already present there.

### 3. Caddy site block
Add to the droplet's Caddyfile (then `caddy reload` / `systemctl reload caddy`).
CSP and the rest of the security headers are already emitted by Next
(`next.config.ts`); Caddy adds HSTS and strips server-identifying headers.

```caddy
penlearn.guardcybersolutionsllc.com {
    encode zstd gzip
    reverse_proxy 127.0.0.1:3014

    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        -Server
        -X-Powered-By
        -x-nextjs-cache
        -x-nextjs-prerender
        -x-nextjs-stale-time
        -Via
    }

    @dotfiles path /.git/* /.env /.env.* /.htaccess /.htpasswd
    respond @dotfiles 404
}
```

### 4. DNS
Point `penlearn.guardcybersolutionsllc.com` at the droplet. Behind Cloudflare: add the record
**proxied (orange cloud)**, Min TLS 1.2, and confirm `dig +short penlearn.guardcybersolutionsllc.com`
returns a Cloudflare IP, not the origin.

---

## Deploying

Push (or merge) to `main` → the workflow builds, scans, and ships automatically.
Manual trigger: `Actions → Deploy → Run workflow`.

Gates: **typecheck** and **Trivy (CRITICAL/HIGH)** are blocking. **Lint** is
currently non-blocking — there is pre-existing lint debt
(`react/no-unescaped-entities`, `set-state-in-effect`, anonymous default exports)
unrelated to deployment. Clean it up, then flip the lint step to blocking by
removing `continue-on-error: true` in `deploy.yml`.

## Rollback

Every release is tagged `latest` + the git SHA. To roll back:
```bash
ssh <DEPLOY_USER>@<DEPLOY_HOST>
cd /opt/apps/penlearn
sed -i 's|penlearn:latest|penlearn:<previous-sha>|' podman-compose.prod.yml
podman-compose -f podman-compose.prod.yml pull && podman-compose -f podman-compose.prod.yml up -d
```
Re-point to `:latest` once the next good build lands.

## Notes

- If the droplet isolates app users (`chmod 700` per app), the SSH user may need
  to drop to the app user — wrap the deploy `script` body in
  `sudo -u <app-user> -i bash <<EOF ... EOF` (see patterns-deploy.md § Registry
  Auth Without PATs).
- First push creates the `ghcr.io/ixiondt/penlearn` package (private by default);
  the workflow token can pull it during deploy. Make it public only if you want
  unauthenticated pulls.
- Post-deploy: `curl -sI https://penlearn.guardcybersolutionsllc.com/` should show no `Server`
  / `X-Powered-By` header; check securityheaders.com for an A/A+.
