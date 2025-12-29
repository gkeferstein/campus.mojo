# Production Dockerfile for Next.js Frontend
# Build context is /root/projects (parent of campus.mojo)

FROM node:22-alpine AS deps
WORKDIR /app

# Copy design.mojo package dist and src
COPY design.mojo/packages/design/dist /design-system/dist
COPY design.mojo/packages/design/src/styles /design-system/src/styles
COPY design.mojo/packages/design/tailwind.config.ts /design-system/tailwind.config.ts

# Use pre-configured package.json for Docker (without workspace: deps)
COPY campus.mojo/packages/frontend/docker/design-package.json /design-system/package.json

# Install design-system dependencies
WORKDIR /design-system
RUN npm install --legacy-peer-deps

# Back to app and copy frontend package.json
WORKDIR /app
COPY campus.mojo/packages/frontend/package.json ./

# Update the @mojo/design path for Docker context
RUN sed -i 's|file:../../../design.mojo/packages/design|file:/design-system|g' package.json

# Install dependencies
RUN npm install --legacy-peer-deps

FROM node:22-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_DIRECTUS_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_DIRECTUS_URL=$NEXT_PUBLIC_DIRECTUS_URL

# Copy design system with its node_modules
COPY --from=deps /design-system /design-system

# Copy modified package.json from deps stage (with correct @mojo/design path)
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
