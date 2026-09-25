# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# 1) Abhaengigkeiten installieren
# ---------------------------------------------------------------------------
FROM node:25-bookworm-slim AS deps
WORKDIR /app
# Build-Werkzeuge als Fallback, falls better-sqlite3 kein vorgefertigtes
# Binary fuer die Plattform hat und lokal kompiliert werden muss.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------------------------
# 2) Anwendung bauen (Standalone-Output)
# ---------------------------------------------------------------------------
FROM node:25-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# 3) Schlankes Laufzeit-Image
# ---------------------------------------------------------------------------
FROM node:25-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Der Standalone-Output enthaelt bereits alle Laufzeit-Abhaengigkeiten inkl.
# der nativen Module (serverExternalPackages: better-sqlite3 + bindings).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3000/gate').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
