import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthUser } from '../middleware/auth.js';

interface AuthenticatedRequest extends FastifyRequest {
  user: AuthUser;
}

interface UpdatePreferencesBody {
  morningReminderEnabled?: boolean;
  morningReminderTime?: string;
  eveningReminderEnabled?: boolean;
  eveningReminderTime?: string;
  workshopReminder24h?: boolean;
  workshopReminder1h?: boolean;
  streakWarningEnabled?: boolean;
  communityEnabled?: boolean;
  weeklyDigestEnabled?: boolean;
  timezone?: string;
}

export async function notificationRoutes(fastify: FastifyInstance) {
  // ============================================
  // Notifications
  // ============================================

  // Get user's notifications
  fastify.get(
    '/notifications',
    { preHandler: authenticate },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      const { unreadOnly = 'false', page = '1', limit = '20' } = request.query as {
        unreadOnly?: string;
        page?: string;
        limit?: string;
      };

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = {
        userId: request.user.id,
        ...(unreadOnly === 'true' && { readAt: null }),
      };

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit),
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({
          where: { userId: request.user.id, readAt: null },
        }),
      ]);

      return reply.send({
        notifications: notifications.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          actionUrl: n.actionUrl,
          isRead: !!n.readAt,
          createdAt: n.createdAt,
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
        unreadCount,
      });
    }
  );

  // Mark notification as read
  fastify.post<{ Params: { notificationId: string } }>(
    '/notifications/:notificationId/read',
    { preHandler: authenticate },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      const { notificationId } = request.params;

      const notification = await prisma.notification.findUnique({
        where: { id: notificationId, userId: request.user.id },
      });

      if (!notification) {
        return reply.status(404).send({ error: 'Notification not found' });
      }

      await prisma.notification.update({
        where: { id: notificationId },
        data: { readAt: new Date() },
      });

      return reply.send({ success: true });
    }
  );

  // Mark all notifications as read
  fastify.post(
    '/notifications/read-all',
    { preHandler: authenticate },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      await prisma.notification.updateMany({
        where: { userId: request.user.id, readAt: null },
        data: { readAt: new Date() },
      });

      return reply.send({ success: true });
    }
  );

  // ============================================
  // Notification Preferences
  // ============================================

  // Get notification preferences
  fastify.get(
    '/notifications/preferences',
    { preHandler: authenticate },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      let prefs = await prisma.notificationPreference.findUnique({
        where: { userId: request.user.id },
      });

      if (!prefs) {
        // Create default preferences
        prefs = await prisma.notificationPreference.create({
          data: { userId: request.user.id },
        });
      }

      return reply.send({
        preferences: {
          morningReminderEnabled: prefs.morningReminderEnabled,
          morningReminderTime: prefs.morningReminderTime,
          eveningReminderEnabled: prefs.eveningReminderEnabled,
          eveningReminderTime: prefs.eveningReminderTime,
          workshopReminder24h: prefs.workshopReminder24h,
          workshopReminder1h: prefs.workshopReminder1h,
          streakWarningEnabled: prefs.streakWarningEnabled,
          communityEnabled: prefs.communityEnabled,
          weeklyDigestEnabled: prefs.weeklyDigestEnabled,
          timezone: prefs.timezone,
        },
      });
    }
  );

  // Update notification preferences
  fastify.patch<{ Body: UpdatePreferencesBody }>(
    '/notifications/preferences',
    { preHandler: authenticate },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      const updates = request.body;

      // Validate time format
      if (updates.morningReminderTime && !/^\d{2}:\d{2}$/.test(updates.morningReminderTime)) {
        return reply.status(400).send({ error: 'Invalid time format. Use HH:MM' });
      }
      if (updates.eveningReminderTime && !/^\d{2}:\d{2}$/.test(updates.eveningReminderTime)) {
        return reply.status(400).send({ error: 'Invalid time format. Use HH:MM' });
      }

      const prefs = await prisma.notificationPreference.upsert({
        where: { userId: request.user.id },
        create: {
          userId: request.user.id,
          ...updates,
        },
        update: updates,
      });

      return reply.send({
        preferences: {
          morningReminderEnabled: prefs.morningReminderEnabled,
          morningReminderTime: prefs.morningReminderTime,
          eveningReminderEnabled: prefs.eveningReminderEnabled,
          eveningReminderTime: prefs.eveningReminderTime,
          workshopReminder24h: prefs.workshopReminder24h,
          workshopReminder1h: prefs.workshopReminder1h,
          streakWarningEnabled: prefs.streakWarningEnabled,
          communityEnabled: prefs.communityEnabled,
          weeklyDigestEnabled: prefs.weeklyDigestEnabled,
          timezone: prefs.timezone,
        },
      });
    }
  );

  // ============================================
  // Notification Creation Helpers (for internal use)
  // ============================================

  // These would typically be called by cron jobs or other services

  // Create check-in reminder
  fastify.post(
    '/notifications/internal/checkin-reminder',
    async (request, reply) => {
      // This would be called by a cron job
      // For now, just return success
      // In production, this would:
      // 1. Get all users with morning/evening reminders enabled
      // 2. Check their timezone and last check-in
      // 3. Create notifications for those who need reminders
      
      return reply.send({ 
        success: true, 
        message: 'Check-in reminders would be sent here' 
      });
    }
  );

  // Create streak warning
  fastify.post(
    '/notifications/internal/streak-warning',
    async (request, reply) => {
      // This would be called by a cron job
      // Check users who haven't checked in today and have a streak > 0
      
      return reply.send({ 
        success: true, 
        message: 'Streak warnings would be sent here' 
      });
    }
  );
}

// ============================================
// Notification Helper Functions (exported for use by other modules)
// ============================================

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  actionUrl?: string
) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      actionUrl,
    },
  });
}

export async function createBadgeNotification(userId: string, badgeSlug: string, badgeName: string) {
  return createNotification(
    userId,
    'badge_earned',
    '🏆 Neues Abzeichen!',
    `Du hast das Abzeichen "${badgeName}" verdient!`,
    '/progress#badges'
  );
}

export async function createStreakWarningNotification(userId: string, currentStreak: number) {
  return createNotification(
    userId,
    'streak_warning',
    '🔥 Dein Streak ist in Gefahr!',
    `Du hast heute noch nicht eingecheckt. Halte deinen ${currentStreak}-Tage Streak am Leben!`,
    '/onboarding/checkin'
  );
}

export async function createWorkshopReminderNotification(
  userId: string, 
  workshopTitle: string, 
  hoursUntil: number,
  workshopId: string
) {
  const timeText = hoursUntil === 1 ? 'in 1 Stunde' : `in ${hoursUntil} Stunden`;
  return createNotification(
    userId,
    'workshop_reminder',
    `📅 Workshop ${timeText}`,
    `"${workshopTitle}" startet ${timeText}. Bereite dich vor!`,
    `/workshops/${workshopId}`
  );
}

export async function createMorningReminderNotification(userId: string) {
  return createNotification(
    userId,
    'checkin_reminder',
    '☀️ Guten Morgen!',
    'Wie geht es dir heute? Starte mit deinem LEBENSENERGIE Check-in in den Tag.',
    '/onboarding/checkin'
  );
}

export async function createEveningReminderNotification(userId: string) {
  return createNotification(
    userId,
    'checkin_reminder',
    '🌙 Zeit für Reflexion',
    'Wie war dein Tag? Tracke deine LEBENSENERGIE bevor du schlafen gehst.',
    '/onboarding/checkin'
  );
}

// ============================================
// Messaging Notifications
// ============================================

/**
 * Create notification for new message
 * Called by messaging.mojo webhook or polling service
 */
export async function createMessageNotification(
  userId: string,
  conversationId: string,
  senderName: string,
  messagePreview: string,
  conversationType: 'DIRECT' | 'GROUP' | 'SUPPORT'
) {
  const title = conversationType === 'DIRECT'
    ? `💬 Neue Nachricht von ${senderName}`
    : conversationType === 'GROUP'
    ? `💬 Neue Nachricht in ${senderName}`
    : `💬 Neue Support-Nachricht`;

  const message = messagePreview.length > 100
    ? `${messagePreview.substring(0, 100)}...`
    : messagePreview;

  return createNotification(
    userId,
    'message_new',
    title,
    message,
    `/chat/${conversationId}` // Will be handled by frontend to open messaging.mojo
  );
}

/**
 * Create notification for message reply (in conversation user is part of)
 */
export async function createMessageReplyNotification(
  userId: string,
  conversationId: string,
  senderName: string,
  messagePreview: string,
  conversationName?: string
) {
  const title = conversationName
    ? `💬 Antwort in ${conversationName}`
    : `💬 Antwort von ${senderName}`;

  const message = messagePreview.length > 100
    ? `${messagePreview.substring(0, 100)}...`
    : messagePreview;

  return createNotification(
    userId,
    'message_reply',
    title,
    message,
    `/chat/${conversationId}`
  );
}

/**
 * Create notification for contact request
 */
export async function createContactRequestNotification(
  userId: string,
  requesterName: string,
  message?: string
) {
  const preview = message && message.length > 100
    ? `${message.substring(0, 100)}...`
    : message || 'Möchte mit dir in Kontakt treten.';

  return createNotification(
    userId,
    'contact_request',
    `👋 Kontaktanfrage von ${requesterName}`,
    preview,
    '/notifications?type=contact_requests'
  );
}

