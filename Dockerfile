# PROJ-14: Produktions-Image für die Next.js-App (App Router inkl. API + react-pdf).
# Multi-Stage; nutzt `output: "standalone"`. Läuft auf dem Hetzner Cloud Server.

# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build ----
FROM base AS builder
# NEXT_PUBLIC_* werden zur Buildzeit in den Client inlined → als Build-Args
# übergeben (öffentliche Werte: Supabase-URL + Anon-Key; keine Secrets).
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_TELEMETRY_DISABLED=1
# Aktiviert `output: "standalone"` (siehe next.config.ts).
ENV NEXT_OUTPUT_STANDALONE=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- Runtime ----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Standalone-Server + statische Assets + public/ (Fonts/Banner für das
# serverseitige PDF — public/ wird vom Standalone-Build NICHT mitkopiert!).
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
