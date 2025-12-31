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

# Install git for cloning design.mojo as fallback
RUN apk add --no-cache git

# Try to install dependencies from GitHub Packages first
# If that fails, clone design.mojo and use file: link
RUN set +e && \
    npm install --legacy-peer-deps 2>&1 | tee /tmp/npm-install.log && \
    if [ $? -ne 0 ] || [ ! -d "node_modules/@gkeferstein/design" ]; then \
      echo "⚠️ Installation from GitHub Packages failed or package not found, cloning design.mojo as fallback..." && \
      if [ -n "$GITHUB_TOKEN" ]; then \
        git clone --depth 1 https://${GITHUB_TOKEN}@github.com/gkeferstein/design.mojo.git /tmp/design.mojo || \
        git clone --depth 1 https://github.com/gkeferstein/design.mojo.git /tmp/design.mojo; \
      else \
        git clone --depth 1 https://github.com/gkeferstein/design.mojo.git /tmp/design.mojo; \
      fi && \
      mkdir -p ../design.mojo/packages && \
      cp -r /tmp/design.mojo/packages/design ../design.mojo/packages/ && \
      sed -i 's|"@gkeferstein/design": "[^"]*"|"@gkeferstein/design": "file:../design.mojo/packages/design"|g' package.json && \
      echo "✅ Updated package.json to use local design.mojo" && \
      npm install --legacy-peer-deps; \
    fi && \
    set -e && \
    echo "✅ Verifying @gkeferstein/design installation:" && \
    ls -la node_modules/@gkeferstein/design || (echo "❌ @gkeferstein/design not found in node_modules" && cat /tmp/npm-install.log && exit 1)

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

# Copy design.mojo if it was used as fallback
# Check if it exists in deps stage (it will only exist if GitHub Packages install failed)
RUN --mount=from=deps,source=/app/../design.mojo,target=/tmp/check-design \
    if [ -d /tmp/check-design ]; then \
      cp -r /tmp/check-design ../design.mojo && \
      echo "✅ Copied design.mojo from deps stage"; \
    else \
      echo "ℹ️ design.mojo not found, package was installed from GitHub Packages"; \
    fi

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
