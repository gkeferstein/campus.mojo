/**
 * Tenant Isolation Middleware
 * Ensures users can only access data from tenants they are members of
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { ForbiddenError } from '../lib/errors.js';

/**
 * Verify that the user has access to the tenant specified in the request
 */
export async function verifyTenantAccess(
  request: FastifyRequest,
  reply: FastifyReply,
  tenantId: string
): Promise<void> {
  if (!request.user) {
    return reply.status(401).send({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Nicht authentifiziert',
      },
    });
  }

  // Check if user is a member of the tenant
  const membership = await prisma.tenantMembership.findUnique({
    where: {
      userId_tenantId: {
        userId: request.user.id,
        tenantId,
      },
    },
  });

  // Also check if user's personal tenant matches
  if (!membership && request.user.tenantId !== tenantId) {
    throw new ForbiddenError('Keine Berechtigung für diesen Tenant');
  }
}

/**
 * Middleware to verify tenant access from request.tenant
 */
export async function verifyRequestTenantAccess(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (!request.user) {
    return;
  }

  // If tenant is set in request, verify access
  if (request.tenant) {
    await verifyTenantAccess(request, reply, request.tenant.id);
  }
}

