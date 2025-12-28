import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export async function meRoutes(fastify: FastifyInstance): Promise<void> {
  // Get current user
  fastify.get('/me', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        tenantId: true,
        createdAt: true,
        memberships: {
          select: {
            role: true,
            tenant: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    return reply.send(user);
  });

  // Update profile
  fastify.patch('/me', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const body = updateProfileSchema.parse(request.body);

    const user = await prisma.user.update({
      where: { id: request.user!.id },
      data: body,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        tenantId: true,
      },
    });

    return reply.send(user);
  });

  // Get my enrollments with progress
  fastify.get('/me/enrollments', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: request.user!.id },
      orderBy: { lastAccessedAt: 'desc' },
    });

    return reply.send(enrollments);
  });

  // Get my entitlements
  fastify.get('/me/entitlements', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const entitlements = await prisma.entitlement.findMany({
      where: {
        userId: request.user!.id,
        revokedAt: null,
        OR: [
          { validUntil: null },
          { validUntil: { gte: new Date() } },
        ],
      },
    });

    return reply.send(entitlements);
  });
}



