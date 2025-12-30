# Production Dockerfile for LMS API
FROM node:22-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Install dependencies
COPY package*.json ./
RUN sed -i '/@mojo\/tenant/d' package.json && npm install --legacy-peer-deps

# Create stub for @mojo/tenant AFTER npm install
RUN mkdir -p node_modules/@mojo/tenant && \
    echo '{"name":"@mojo/tenant","version":"1.0.0","main":"index.js","types":"index.d.ts"}' > node_modules/@mojo/tenant/package.json && \
    echo 'export const TENANT_HEADERS = { tenantId: "x-tenant-id", tenantSlug: "x-tenant-slug" }; export function extractTenantFromHeaders() { return null; }' > node_modules/@mojo/tenant/index.js && \
    echo 'export interface Tenant { id: string; slug: string; name: string; clerkOrgId?: string; isPersonal: boolean; status: "active" | "pending" | "suspended"; createdAt: Date; updatedAt: Date; } export interface TenantContext { tenant: Tenant; source: string; } export declare const TENANT_HEADERS: { tenantId: string; tenantSlug: string; }; export declare function extractTenantFromHeaders(headers: Record<string, string>): { type: "id" | "slug"; value: string } | null;' > node_modules/@mojo/tenant/index.d.ts

# Copy source and build
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image
FROM node:22-alpine AS runner

WORKDIR /app

# Install wget for healthcheck and openssl for Prisma
RUN apk add --no-cache wget openssl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Generate Prisma client in production
RUN npx prisma generate

# Switch to non-root user
USER nodejs

ENV PORT=3001

EXPOSE 3001

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]

