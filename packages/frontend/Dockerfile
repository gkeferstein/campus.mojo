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
COPY campus.mojo/packages/frontend/package.json ./

# Update the @mojo/design to use npm package instead of file reference
RUN sed -i 's|file:../../../design.mojo/packages/design|@gkeferstein/design|g' package.json || \
    sed -i 's|"@mojo/design": ".*"|"@mojo/design": "^1.0.0"|g' package.json || true

# Configure npm for GitHub Packages (if not already configured)
RUN if [ -n "$GITHUB_TOKEN" ] && [ ! -f ~/.npmrc ]; then \
      echo "@gkeferstein:registry=https://npm.pkg.github.com" > ~/.npmrc && \
      echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> ~/.npmrc && \
      echo "always-auth=true" >> ~/.npmrc; \
    fi

# Install dependencies (including @gkeferstein/design from GitHub Packages)
RUN npm install --legacy-peer-deps

FROM node:22-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_DIRECTUS_URL
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_DIRECTUS_URL=$NEXT_PUBLIC_DIRECTUS_URL
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

# Copy package.json and node_modules from deps stage
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules

# Copy frontend source files
COPY campus.mojo/packages/frontend/src ./src
COPY campus.mojo/packages/frontend/public ./public
COPY campus.mojo/packages/frontend/next.config.ts ./next.config.ts
COPY campus.mojo/packages/frontend/tailwind.config.ts ./tailwind.config.ts
COPY campus.mojo/packages/frontend/postcss.config.mjs ./postcss.config.mjs
COPY campus.mojo/packages/frontend/tsconfig.json ./tsconfig.json

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
