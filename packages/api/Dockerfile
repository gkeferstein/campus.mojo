# Production Dockerfile for LMS API
FROM node:22-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image
FROM node:22-alpine AS runner

WORKDIR /app

# Install wget for healthcheck and openssl for Prisma
RUN apk add --no-cache wget openssl

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client in production
RUN npx prisma generate

ENV PORT=3001

EXPOSE 3001

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]

