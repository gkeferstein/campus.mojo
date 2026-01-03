import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { verifyWebhook } from '../middleware/webhook-verify.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import {
  createMessageNotification,
  createMessageReplyNotification,
  createContactRequestNotification,
} from './notifications.js';

// Original payment webhook for course purchases
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

// B2C Subscription webhook schema (LEBENSENERGIE / RESILIENZ)
const subscriptionWebhookSchema = z.object({
  event: z.enum([
    'subscription.created',
    'subscription.renewed',
    'subscription.upgraded',
    'subscription.downgraded',
    'subscription.cancelled',
    'subscription.expired',
    'trial.started',
    'trial.ended',
  ]),
  data: z.object({
    userId: z.string().uuid().optional(),
    email: z.string().email(),
    tier: z.enum(['lebensenergie', 'resilienz']),
    paymentId: z.string().optional(),
    subscriptionId: z.string().optional(),
    amount: z.number().optional(), // in cents
    currency: z.string().default('EUR'),
    interval: z.enum(['monthly', 'yearly', 'triennial']).optional(),
    validFrom: z.string().datetime().optional(),
    validUntil: z.string().datetime().optional(),
    trialEndsAt: z.string().datetime().optional(),
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

  // POST /webhooks/subscription - Handle B2C subscription webhooks (LEBENSENERGIE / RESILIENZ)
  fastify.post('/webhooks/subscription', {
    preHandler: [verifyWebhook],
  }, async (request, reply) => {
    const body = subscriptionWebhookSchema.parse(request.body);

    // Log webhook event
    const event = await prisma.webhookEvent.create({
      data: {
        source: 'subscription',
        eventType: body.event,
        payload: body as object,
      },
    });

    try {
      // Find user by email or userId
      let user = body.data.userId 
        ? await prisma.user.findUnique({ where: { id: body.data.userId } })
        : await prisma.user.findUnique({ where: { email: body.data.email } });

      if (!user) {
        await prisma.webhookEvent.update({
          where: { id: event.id },
          data: { error: 'User not found' },
        });
        return reply.status(400).send({ error: 'User not found' });
      }

      // Get or create journey
      let journey = await prisma.userJourney.findUnique({
        where: { userId: user.id },
      });

      if (!journey) {
        journey = await prisma.userJourney.create({
          data: { userId: user.id, state: 'onboarding_start' },
        });
      }

      switch (body.event) {
        case 'subscription.created':
        case 'subscription.renewed': {
          // Activate subscription
          const state = body.data.tier === 'resilienz' ? 'resilienz_active' : 'lebensenergie_active';
          
          await prisma.userJourney.update({
            where: { userId: user.id },
            data: {
              state,
              subscriptionTier: body.data.tier,
              subscriptionStartAt: body.data.validFrom ? new Date(body.data.validFrom) : new Date(),
              subscriptionEndsAt: body.data.validUntil ? new Date(body.data.validUntil) : null,
            },
          });

          logger.info({ userId: user.id, tier: body.data.tier }, 'Subscription activated');
          break;
        }

        case 'subscription.upgraded': {
          // Upgrade to RESILIENZ
          await prisma.userJourney.update({
            where: { userId: user.id },
            data: {
              state: 'resilienz_active',
              subscriptionTier: 'resilienz',
              subscriptionEndsAt: body.data.validUntil ? new Date(body.data.validUntil) : null,
            },
          });

          // Award upgrade badge
          await prisma.userBadge.upsert({
            where: { userId_badgeSlug: { userId: user.id, badgeSlug: 'resilienz-upgrade' } },
            create: { userId: user.id, badgeSlug: 'resilienz-upgrade' },
            update: {},
          });

          logger.info({ userId: user.id }, 'Subscription upgraded to RESILIENZ');
          break;
        }

        case 'subscription.downgraded': {
          // Downgrade to LEBENSENERGIE
          await prisma.userJourney.update({
            where: { userId: user.id },
            data: {
              state: 'lebensenergie_active',
              subscriptionTier: 'lebensenergie',
              subscriptionEndsAt: body.data.validUntil ? new Date(body.data.validUntil) : null,
            },
          });

          logger.info({ userId: user.id }, 'Subscription downgraded to LEBENSENERGIE');
          break;
        }

        case 'subscription.cancelled':
        case 'subscription.expired': {
          // Deactivate subscription - user keeps access until validUntil
          await prisma.userJourney.update({
            where: { userId: user.id },
            data: {
              // Keep current state until expiry, then check via cron/middleware
              subscriptionEndsAt: body.data.validUntil ? new Date(body.data.validUntil) : new Date(),
            },
          });

          logger.info({ userId: user.id, tier: body.data.tier }, 'Subscription cancelled/expired');
          break;
        }

        case 'trial.started': {
          // Start 7-day trial
          const trialEndsAt = body.data.trialEndsAt 
            ? new Date(body.data.trialEndsAt)
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

          await prisma.userJourney.update({
            where: { userId: user.id },
            data: {
              state: 'trial_active',
              trialStartedAt: new Date(),
              trialEndsAt,
            },
          });

          logger.info({ userId: user.id, trialEndsAt }, 'Trial started');
          break;
        }

        case 'trial.ended': {
          // Trial ended without conversion
          await prisma.userJourney.update({
            where: { userId: user.id },
            data: {
              state: journey.checkInsCompleted >= 3 ? 'onboarding_first_module' : 'onboarding_checkin',
              trialEndsAt: new Date(),
            },
          });

          logger.info({ userId: user.id }, 'Trial ended');
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
          // Update or create user profile (SSO only - no password)
          // Generate a temporary clerkUserId for kontakte imports
          const tempClerkUserId = `kontakte_${Date.now()}_${body.data.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
          await prisma.user.upsert({
            where: { email: body.data.email },
            create: {
              email: body.data.email,
              clerkUserId: tempClerkUserId,
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

  // POST /webhooks/messaging - Handle messaging.mojo webhooks
  const messagingWebhookSchema = z.object({
    event: z.enum(['message.new', 'message.reply', 'contact.request']),
    data: z.object({
      userId: z.string().uuid(), // Recipient user ID
      conversationId: z.string().optional(),
      senderId: z.string().uuid().optional(),
      senderName: z.string().optional(),
      messagePreview: z.string().optional(),
      conversationType: z.enum(['DIRECT', 'GROUP', 'SUPPORT']).optional(),
      conversationName: z.string().optional(),
      requesterName: z.string().optional(),
      message: z.string().optional(),
    }),
  });

  fastify.post('/webhooks/messaging', {
    preHandler: [verifyWebhook],
  }, async (request, reply) => {
    const body = messagingWebhookSchema.parse(request.body);

    // Log webhook event
    const event = await prisma.webhookEvent.create({
      data: {
        source: 'messaging',
        eventType: body.event,
        payload: body as object,
      },
    });

    try {
      const { userId, conversationId, senderId, senderName, messagePreview, conversationType, conversationName, requesterName, message } = body.data;

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        await prisma.webhookEvent.update({
          where: { id: event.id },
          data: { error: 'User not found' },
        });
        return reply.status(400).send({ error: 'User not found' });
      }

      switch (body.event) {
        case 'message.new': {
          if (!conversationId || !senderName || !messagePreview || !conversationType) {
            throw new Error('Missing required fields for message.new event');
          }
          await createMessageNotification(
            userId,
            conversationId,
            senderName,
            messagePreview,
            conversationType
          );
          break;
        }

        case 'message.reply': {
          if (!conversationId || !senderName || !messagePreview) {
            throw new Error('Missing required fields for message.reply event');
          }
          await createMessageReplyNotification(
            userId,
            conversationId,
            senderName,
            messagePreview,
            conversationName
          );
          break;
        }

        case 'contact.request': {
          if (!requesterName) {
            throw new Error('Missing required fields for contact.request event');
          }
          await createContactRequestNotification(
            userId,
            requesterName,
            message
          );
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






