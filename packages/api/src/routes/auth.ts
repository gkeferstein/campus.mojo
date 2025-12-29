import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth.js';

/**
 * Auth Routes for campus.mojo
 * 
 * Authentication is handled by Clerk - no local login/register needed.
 * This module provides helper endpoints for checking auth status.
 */

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /auth/status
   * Check if the current request is authenticated
   * Useful for frontend to verify token validity
   */
  fastify.get('/status', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    return reply.send({
      authenticated: true,
      user: {
        id: request.user!.id,
        email: request.user!.email,
        firstName: request.user!.firstName,
        lastName: request.user!.lastName,
        tenantId: request.user!.tenantId,
      },
    });
  });

  /**
   * GET /auth/check
   * Lightweight auth check (no user lookup)
   * Returns 200 if authenticated, 401 if not
   */
  fastify.get('/check', {
    preHandler: [authenticate],
  }, async (_request, reply) => {
    return reply.send({ ok: true });
  });
}

export default authRoutes;
