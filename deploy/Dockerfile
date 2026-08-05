# ── ChinaBridge self-hosted image ──────────────────────────────
# Build from the PROJECT ROOT:
#   docker compose -f deploy/docker-compose.yml up -d --build
FROM node:20-bookworm-slim

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the whole project (includes your .env — see deploy/README.md)
COPY . .

# Build frontend bundle + bundled server (outputs dist/)
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
