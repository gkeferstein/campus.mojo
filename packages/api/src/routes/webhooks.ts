import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { verifyWebhook } from '../middleware/webhook-verify.js';
import { prisma } from '../lib/prisma.js';

const paymentWebhookSchema = z.object({
  event: z.enum(['payment.completed', 'payment.refunded', 'subscription.cancelled']),
  data: z.object({
    userId: z.string().uuid().optional(),
    email: z.string().email().optional(),
    courseId: z.string(),
    paymentId: z.string().optional(),
    validUntil: z.string().datetime().optional(),
  }),
});

const crmWebhookSchema = z.object({
  event: z.enum(['contact.created', 'contact.updated', 'membership.changed']),
  data: z.object({
    email: z.string().email(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    tenantId: z.string().uuid().optional(),
    tenantSlug: z.string().optional(),
    role: z.string().optional(),
  }),
});

export async function webhooksRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /webhooks/payments - Handle payment webhooks
  fastify.post('/webhooks/payments', {
    preHandler: [verifyWebhook],
  }, async (request, reply) => {
    const body = paymentWebhookSchema.parse(request.body);

    // Log webhook event
    const event = await prisma.webhookEvent.create({
      data: {
        source: 'payments',
        eventType: body.event,
        payload: body as object,
      },
    });

    try {
      // Find or identify user
      let userId = body.data.userId;
      
      if (!userId && body.data.email) {
        const user = await prisma.user.findUnique({
          where: { email: body.data.email },
        });
        userId = user?.id;
      }

      if (!userId) {
        await prisma.webhookEvent.update({
          where: { id: event.id },
          data: { error: 'User not found' },
        });
        return reply.status(400).send({ error: 'User not found' });
      }

      switch (body.event) {
        case 'payment.completed': {
          // Grant entitlement
          await prisma.entitlement.upsert({
            where: {
              userId_courseId: {
                userId,
                courseId: body.data.courseId,
              },
            },
            create: {
              userId,
              courseId: body.data.courseId,
              source: 'payment',
              sourceRef: body.data.paymentId,
              validUntil: body.data.validUntil ? new Date(body.data.validUntil) : null,
            },
            update: {
              revokedAt: null, // Un-revoke if previously revoked
              validUntil: body.data.validUntil ? new Date(body.data.validUntil) : null,
            },
          });
          break;
        }

        case 'payment.refunded':
        case 'subscription.cancelled': {
          // Revoke entitlement
          await prisma.entitlement.updateMany({
            where: {
              userId,
              courseId: body.data.courseId,
              source: 'payment',
            },
            data: {
              revokedAt: new Date(),
            },
          });
          break;
        }
      }

      // Mark as processed
      await prisma.webhookEvent.update({
        where: { id: event.id },
        data: { processedAt: new Date() },
      });

      return reply.send({ success: true, eventId: event.id });
    } catch (error) {
      await prisma.webhookEvent.update({
        where: { id: event.id },
        data: { error: String(error) },
      });
      throw error;
    }
  });

  // POST /webhooks/crm - Handle CRM webhooks
  fastify.post('/webhooks/crm', {
    preHandler: [verifyWebhook],
  }, async (request, reply) => {
    const body = crmWebhookSchema.parse(request.body);

    // Log webhook event
    const event = await prisma.webhookEvent.create({
      data: {
        source: 'crm',
        eventType: body.event,
        payload: body as object,
      },
    });

    try {
      switch (body.event) {
        case 'contact.created':
        case 'contact.updated': {
          // Update or create user profile
          await prisma.user.upsert({
            where: { email: body.data.email },
            create: {
              email: body.data.email,
              passwordHash: '', // No password - SSO only
              firstName: body.data.firstName,
              lastName: body.data.lastName,
              tenantId: body.data.tenantId,
            },
            update: {
              firstName: body.data.firstName,
              lastName: body.data.lastName,
              tenantId: body.data.tenantId,
            },
          });
          break;
        }

        case 'membership.changed': {
          const user = await prisma.user.findUnique({
            where: { email: body.data.email },
          });

          if (!user) {
            await prisma.webhookEvent.update({
              where: { id: event.id },
              data: { error: 'User not found' },
            });
            return reply.status(400).send({ error: 'User not found' });
          }

          // Find or create tenant
          let tenantId = body.data.tenantId;
          
          if (!tenantId && body.data.tenantSlug) {
            const tenant = await prisma.tenant.upsert({
              where: { slug: body.data.tenantSlug },
              create: {
                name: body.data.tenantSlug,
                slug: body.data.tenantSlug,
              },
              update: {},
            });
            tenantId = tenant.id;
          }

          if (tenantId) {
            await prisma.tenantMembership.upsert({
              where: {
                userId_tenantId: {
                  userId: user.id,
                  tenantId,
                },
              },
              create: {
                userId: user.id,
                tenantId,
                role: body.data.role || 'member',
              },
              update: {
                role: body.data.role || 'member',
              },
            });
          }
          break;
        }
      }

      // Mark as processed
      await prisma.webhookEvent.update({
        where: { id: event.id },
        data: { processedAt: new Date() },
      });

      return reply.send({ success: true, eventId: event.id });
    } catch (error) {
      await prisma.webhookEvent.update({
        where: { id: event.id },
        data: { error: String(error) },
      });
      throw error;
    }
  });
}

