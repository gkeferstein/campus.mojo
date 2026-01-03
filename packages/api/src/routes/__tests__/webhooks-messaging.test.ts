/**
 * Tests for messaging webhook route
 */

import { describe, it, expect, beforeEach, afterEach } from 'node:test';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../index.test.js';
import { prisma } from '../../lib/prisma.js';
import { createHmac } from 'crypto';

describe('Messaging Webhook', () => {
  let app: FastifyInstance;
  let testUserId: string;
  const webhookSecret = process.env.WEBHOOK_SECRET || 'test-secret';

  // Helper to create webhook signature
  function createSignature(body: object): string {
    return createHmac('sha256', webhookSecret)
      .update(JSON.stringify(body))
      .digest('hex');
  }

  beforeEach(async () => {
    app = await buildApp();
    await app.ready();

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        clerkUserId: `clerk-${Date.now()}`,
      },
    });
    testUserId = user.id;
  });

  afterEach(async () => {
    // Cleanup
    await prisma.notification.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.webhookEvent.deleteMany({
      where: { source: 'messaging' },
    });
    await prisma.user.delete({
      where: { id: testUserId },
    });
    await app.close();
  });

  describe('POST /webhooks/messaging', () => {
    it('should handle message.new event', async () => {
      const payload = {
        event: 'message.new',
        data: {
          userId: testUserId,
          conversationId: 'conv-123',
          senderName: 'John Doe',
          messagePreview: 'Hello!',
          conversationType: 'DIRECT' as const,
        },
      };

      const signature = createSignature(payload);

      const response = await app.inject({
        method: 'POST',
        url: '/webhooks/messaging',
        headers: {
          'x-webhook-signature': signature,
          'content-type': 'application/json',
        },
        payload,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);

      // Verify notification was created
      const notification = await prisma.notification.findFirst({
        where: { userId: testUserId, type: 'message_new' },
      });

      expect(notification).toBeDefined();
      expect(notification?.title).toContain('Neue Nachricht von John Doe');
      expect(notification?.actionUrl).toBe('/chat/conv-123');
    });

    it('should handle message.reply event', async () => {
      const payload = {
        event: 'message.reply',
        data: {
          userId: testUserId,
          conversationId: 'conv-456',
          senderName: 'Jane Doe',
          messagePreview: 'Thanks!',
          conversationName: 'Team Chat',
        },
      };

      const signature = createSignature(payload);

      const response = await app.inject({
        method: 'POST',
        url: '/webhooks/messaging',
        headers: {
          'x-webhook-signature': signature,
          'content-type': 'application/json',
        },
        payload,
      });

      expect(response.statusCode).toBe(200);

      const notification = await prisma.notification.findFirst({
        where: { userId: testUserId, type: 'message_reply' },
      });

      expect(notification).toBeDefined();
      expect(notification?.title).toContain('Antwort in Team Chat');
    });

    it('should handle contact.request event', async () => {
      const payload = {
        event: 'contact.request',
        data: {
          userId: testUserId,
          requesterName: 'Bob Smith',
          message: 'Would like to connect',
        },
      };

      const signature = createSignature(payload);

      const response = await app.inject({
        method: 'POST',
        url: '/webhooks/messaging',
        headers: {
          'x-webhook-signature': signature,
          'content-type': 'application/json',
        },
        payload,
      });

      expect(response.statusCode).toBe(200);

      const notification = await prisma.notification.findFirst({
        where: { userId: testUserId, type: 'contact_request' },
      });

      expect(notification).toBeDefined();
      expect(notification?.title).toContain('Kontaktanfrage von Bob Smith');
    });

    it('should return 400 for invalid user', async () => {
      const payload = {
        event: 'message.new',
        data: {
          userId: 'invalid-user-id',
          conversationId: 'conv-123',
          senderName: 'John Doe',
          messagePreview: 'Hello!',
          conversationType: 'DIRECT' as const,
        },
      };

      const signature = createSignature(payload);

      const response = await app.inject({
        method: 'POST',
        url: '/webhooks/messaging',
        headers: {
          'x-webhook-signature': signature,
          'content-type': 'application/json',
        },
        payload,
      });

      expect(response.statusCode).toBe(400);
    });

    it('should log webhook event', async () => {
      const payload = {
        event: 'message.new',
        data: {
          userId: testUserId,
          conversationId: 'conv-123',
          senderName: 'John Doe',
          messagePreview: 'Hello!',
          conversationType: 'DIRECT' as const,
        },
      };

      await app.inject({
        method: 'POST',
        url: '/webhooks/messaging',
        headers: {
          'x-webhook-secret': webhookSecret,
          'content-type': 'application/json',
        },
        payload,
      });

      const webhookEvent = await prisma.webhookEvent.findFirst({
        where: { source: 'messaging', eventType: 'message.new' },
      });

      expect(webhookEvent).toBeDefined();
      expect(webhookEvent?.processedAt).toBeDefined();
    });
  });
});

