# syntax=docker/dockerfile:1
# Multi-stage build for Next.js 16 standalone output.

# ---- deps: install node_modules ----
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
# npm install (not ci): tolerant of a Windows-generated lockfile that is missing
# Linux optional binaries (see patterns-deploy.md § Lockfile Drift).
RUN npm install --no-audit --no-fund

# ---- builder: next build (standalone) ----
FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# prebuild regenerates public/search-index.json, then next build emits .next/standalone
RUN npm run build

# ---- runner: minimal standalone server ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
# standalone bundles a minimal node_modules + server.js; public/ and static/ are copied separately
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
