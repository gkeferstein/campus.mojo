# Production Dockerfile for Next.js Frontend
# Build context is packages/frontend

FROM node:22-alpine AS deps
WORKDIR /app

# Configure npm for GitHub Packages
ARG GITHUB_TOKEN
RUN if [ -n "$GITHUB_TOKEN" ]; then \
      echo "@gkeferstein:registry=https://npm.pkg.github.com" > ~/.npmrc && \
      echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> ~/.npmrc && \
      echo "always-auth=true" >> ~/.npmrc; \
    fi

# Copy frontend package.json first
COPY package.json ./

# Install dependencies from GitHub Packages
# @gkeferstein/design is published to GitHub Packages
RUN npm install --legacy-peer-deps 2>&1 | tee /tmp/npm-install.log || INSTALL_FAILED=1; \
    if [ "${INSTALL_FAILED:-0}" = "1" ] || [ ! -d "node_modules/@gkeferstein/design" ]; then \
      echo "⚠️ Installation from GitHub Packages failed or package not found" && \
      echo "=== npm install log ===" && \
      cat /tmp/npm-install.log && \
      echo "" && \
      echo "⚠️ Attempting to install with public registry as fallback..." && \
      sed -i 's|@gkeferstein:registry=https://npm.pkg.github.com||g' ~/.npmrc 2>/dev/null || true && \
      npm install --legacy-peer-deps 2>&1 | tee /tmp/npm-install-fallback.log || true; \
    fi && \
    echo "✅ Verifying @gkeferstein/design installation:" && \
    if [ ! -d "node_modules/@gkeferstein/design" ]; then \
      echo "❌ @gkeferstein/design not found in node_modules" && \
      echo "Available packages:" && \
      ls -la node_modules/@gkeferstein/ 2>/dev/null || echo "No @gkeferstein packages found" && \
      echo "=== npm install log ===" && \
      cat /tmp/npm-install.log && \
      echo "=== npm install fallback log ===" && \
      cat /tmp/npm-install-fallback.log 2>/dev/null || echo "No fallback log" && \
      exit 1; \
    fi && \
    ls -la node_modules/@gkeferstein/design && \
    echo "✅ @gkeferstein/design successfully installed"

FROM node:22-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_DIRECTUS_URL
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG GITHUB_TOKEN

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_DIRECTUS_URL=$NEXT_PUBLIC_DIRECTUS_URL
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

# Configure npm for GitHub Packages
RUN if [ -n "$GITHUB_TOKEN" ]; then \
      echo "@gkeferstein:registry=https://npm.pkg.github.com" > ~/.npmrc && \
      echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> ~/.npmrc && \
      echo "always-auth=true" >> ~/.npmrc; \
    fi

# Copy package.json and node_modules from deps stage
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules

# @gkeferstein/design is installed from GitHub Packages, no need to copy design.mojo

# Copy frontend source files
COPY src ./src
COPY public ./public
COPY next.config.ts ./next.config.ts
COPY tailwind.config.ts ./tailwind.config.ts
COPY postcss.config.mjs ./postcss.config.mjs
COPY tsconfig.json ./tsconfig.json

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
