# ── Stage 1: dependencias de producción (compila better-sqlite3 para Alpine) ──
FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache python3 make g++
RUN corepack enable

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# ── Stage 2: compilar TypeScript ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++
RUN corepack enable

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --production=false

COPY tsconfig.json ./
COPY src ./src
RUN pnpm build

# ── Stage 3: imagen final de producción ───────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY audios ./audios
COPY package.json ./

# Directorios montados como volúmenes en runtime
RUN mkdir -p /app/session /app/data

RUN addgroup -g 1001 -S nodejs \
    && adduser -S botuser -u 1001 -G nodejs \
    && chown -R botuser:nodejs /app

USER botuser
ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
