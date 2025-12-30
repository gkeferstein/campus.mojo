/**
 * Clerk Authentication Middleware for campus.mojo
 * 
 * Validates Clerk JWT tokens and maps to local User records.
 * Uses the same Clerk account as accounts.mojo for SSO.
 * 
 * Supports @gkeferstein/tenant headers for service-to-service calls.
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { prisma } from '../lib/prisma.js';
import { Tenant as MojoTenant, TenantContext, TENANT_HEADERS, extractTenantFromHeaders } from '@gkeferstein/tenant';
import { logger } from '../lib/logger.js';

export interface AuthUser {
  id: string;
  clerkUserId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  tenantId: string | null;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
    /** @gkeferstein/tenant compatible tenant context */
    tenant: MojoTenant | null;
    tenantContext: TenantContext | null;
  }
}

// Clerk client (lazy initialized)
let clerkClient: ReturnType<typeof createClerkClient> | null = null;

function getClerkClient() {
  if (!clerkClient) {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('CLERK_SECRET_KEY environment variable is not set');
    }
    clerkClient = createClerkClient({ secretKey });
  }
  return clerkClient;
}

/**
 * Convert Prisma Tenant to @gkeferstein/tenant Tenant interface
 */
function toMojoTenant(tenant: {
  id: string;
  slug: string;
  name: string;
  clerkOrgId?: string | null;
  isPersonal?: boolean;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}): MojoTenant {
  return {
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    clerkOrgId: tenant.clerkOrgId ?? undefined,
    isPersonal: tenant.isPersonal ?? false,
    status: (tenant.status as 'active' | 'pending' | 'suspended') ?? 'active',
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt,
  };
}

/**
 * Resolve tenant from headers or user
 */
async function resolveTenant(
  request: FastifyRequest,
  userId?: string
): Promise<{ tenant: MojoTenant | null; source: string }> {
  // 1. Check @gkeferstein/tenant headers first (for service-to-service calls)
  const tenantInfo = extractTenantFromHeaders(request.headers as Record<string, string>);
  
  if (tenantInfo) {
    if (tenantInfo.type === 'id') {
      const tenant = await prisma.tenant.findUnique({ where: { id: tenantInfo.value } });
      if (tenant) {
        return { tenant: toMojoTenant(tenant), source: 'header_id' };
      }
    } else {
      const tenant = await prisma.tenant.findUnique({ where: { slug: tenantInfo.value } });
      if (tenant) {
        return { tenant: toMojoTenant(tenant), source: 'header_slug' };
      }
    }
  }

  // 2. Get tenant from user's tenantId
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });
    if (user?.tenant) {
      return { tenant: toMojoTenant(user.tenant), source: 'user' };
    }
  }

  return { tenant: null, source: 'none' };
}

/**
 * Get or create a local user from Clerk JWT claims
 * User provisioning primarily happens via Clerk webhooks,
 * but this ensures users can access the app even if webhook was delayed
 */
async function getOrCreateUser(
  clerkUserId: string,
  email: string,
  firstName?: string | null,
  lastName?: string | null,
  avatarUrl?: string | null
): Promise<AuthUser | null> {
  // First try to find existing user
  let user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: {
      id: true,
      clerkUserId: true,
      email: true,
      firstName: true,
      lastName: true,
      tenantId: true,
      deletedAt: true,
    },
  });

  // If user is soft-deleted, deny access
  if (user?.deletedAt) {
    return null;
  }

  if (!user) {
    // Create user if not exists (webhook fallback)
    user = await prisma.user.create({
      data: {
        clerkUserId,
        email,
        firstName,
        lastName,
        avatarUrl,
      },
      select: {
        id: true,
        clerkUserId: true,
        email: true,
        firstName: true,
        lastName: true,
        tenantId: true,
        deletedAt: true,
      },
    });
    logger.info({ clerkUserId, email }, 'User created via JWT auth');
  } else {
    // Update user info if changed
    if (
      user.email !== email ||
      user.firstName !== firstName ||
      user.lastName !== lastName
    ) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { email, firstName, lastName, avatarUrl },
        select: {
          id: true,
          clerkUserId: true,
          email: true,
          firstName: true,
          lastName: true,
          tenantId: true,
          deletedAt: true,
        },
      });
    }
  }

  return {
    id: user.id,
    clerkUserId: user.clerkUserId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    tenantId: user.tenantId,
  };
}

/**
 * Required authentication middleware
 * Fails if no valid Clerk JWT is provided
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    const secretKey = process.env.CLERK_SECRET_KEY;

    if (!secretKey) {
      logger.error('CLERK_SECRET_KEY is not configured');
      return reply.status(500).send({ error: 'Authentication not configured' });
    }

    // Verify JWT with Clerk
    const payload = await verifyToken(token, {
      secretKey,
    });

    if (!payload || !payload.sub) {
      return reply.status(401).send({ error: 'Invalid token' });
    }

    // Extract user info from JWT
    const clerkUserId = payload.sub;
    const email = (payload as any).email || '';
    const firstName = (payload as any).first_name || null;
    const lastName = (payload as any).last_name || null;
    const avatarUrl = (payload as any).image_url || null;

    // Get or create local user
    const user = await getOrCreateUser(clerkUserId, email, firstName, lastName, avatarUrl);

    if (!user) {
      return reply.status(401).send({ error: 'User account is deactivated' });
    }

    request.user = user;

    // Resolve tenant
    const { tenant, source } = await resolveTenant(request, user.id);
    request.tenant = tenant;
    request.tenantContext = tenant ? { tenant, source: source as any } : null;

  } catch (err: any) {
    logger.error({ 
      err, 
      name: err.name, 
      code: err.code,
      clerkError: err.clerkError 
    }, 'Auth error');
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }
}

/**
 * Optional authentication middleware
 * Continues without error if no token is provided
 */
export async function optionalAuth(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Still try to resolve tenant from headers
      const { tenant, source } = await resolveTenant(request);
      request.tenant = tenant;
      request.tenantContext = tenant ? { tenant, source: source as any } : null;
      return;
    }

    const token = authHeader.substring(7);
    const secretKey = process.env.CLERK_SECRET_KEY;

    if (!secretKey) {
      return;
    }

    const payload = await verifyToken(token, {
      secretKey,
    });

    if (!payload || !payload.sub) {
      return;
    }

    const clerkUserId = payload.sub;
    const email = (payload as any).email || '';
    const firstName = (payload as any).first_name || null;
    const lastName = (payload as any).last_name || null;
    const avatarUrl = (payload as any).image_url || null;

    const user = await getOrCreateUser(clerkUserId, email, firstName, lastName, avatarUrl);

    if (user) {
      request.user = user;
      
      // Resolve tenant
      const { tenant, source } = await resolveTenant(request, user.id);
      request.tenant = tenant;
      request.tenantContext = tenant ? { tenant, source: source as any } : null;
    } else {
      request.tenant = null;
      request.tenantContext = null;
    }
  } catch {
    // Token is optional, so we don't throw an error
  }
}

export { getClerkClient, getOrCreateUser };
