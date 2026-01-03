/**
 * Tests for notification helper functions
 */

import { describe, it, expect, beforeEach, afterEach } from 'node:test';
import { prisma } from '../../lib/prisma.js';
import {
  createMessageNotification,
  createMessageReplyNotification,
  createContactRequestNotification,
} from '../notifications.js';

describe('Notification Helpers', () => {
  let testUserId: string;

  beforeEach(async () => {
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
    await prisma.user.delete({
      where: { id: testUserId },
    });
  });

  describe('createMessageNotification', () => {
    it('should create notification for DIRECT message', async () => {
      const notification = await createMessageNotification(
        testUserId,
        'conv-123',
        'John Doe',
        'Hello, how are you?',
        'DIRECT'
      );

      expect(notification).toBeDefined();
      expect(notification.userId).toBe(testUserId);
      expect(notification.type).toBe('message_new');
      expect(notification.title).toContain('Neue Nachricht von John Doe');
      expect(notification.message).toBe('Hello, how are you?');
      expect(notification.actionUrl).toBe('/chat/conv-123');
    });

    it('should create notification for GROUP message', async () => {
      const notification = await createMessageNotification(
        testUserId,
        'conv-456',
        'Team Chat',
        'New message in group',
        'GROUP'
      );

      expect(notification.title).toContain('Neue Nachricht in Team Chat');
    });

    it('should truncate long messages', async () => {
      const longMessage = 'A'.repeat(150);
      const notification = await createMessageNotification(
        testUserId,
        'conv-789',
        'John Doe',
        longMessage,
        'DIRECT'
      );

      expect(notification.message.length).toBeLessThanOrEqual(103); // 100 + '...'
      expect(notification.message).toContain('...');
    });
  });

  describe('createMessageReplyNotification', () => {
    it('should create notification for message reply', async () => {
      const notification = await createMessageReplyNotification(
        testUserId,
        'conv-123',
        'John Doe',
        'Thanks for your message!',
        'Team Discussion'
      );

      expect(notification.type).toBe('message_reply');
      expect(notification.title).toContain('Antwort in Team Discussion');
      expect(notification.actionUrl).toBe('/chat/conv-123');
    });

    it('should create notification without conversation name', async () => {
      const notification = await createMessageReplyNotification(
        testUserId,
        'conv-123',
        'John Doe',
        'Thanks!'
      );

      expect(notification.title).toContain('Antwort von John Doe');
    });
  });

  describe('createContactRequestNotification', () => {
    it('should create notification for contact request', async () => {
      const notification = await createContactRequestNotification(
        testUserId,
        'Jane Doe',
        'Would like to connect with you'
      );

      expect(notification.type).toBe('contact_request');
      expect(notification.title).toContain('Kontaktanfrage von Jane Doe');
      expect(notification.message).toBe('Would like to connect with you');
      expect(notification.actionUrl).toBe('/notifications?type=contact_requests');
    });

    it('should create notification without message', async () => {
      const notification = await createContactRequestNotification(
        testUserId,
        'Jane Doe'
      );

      expect(notification.message).toBe('Möchte mit dir in Kontakt treten.');
    });

    it('should truncate long messages', async () => {
      const longMessage = 'A'.repeat(150);
      const notification = await createContactRequestNotification(
        testUserId,
        'Jane Doe',
        longMessage
      );

      expect(notification.message.length).toBeLessThanOrEqual(103);
      expect(notification.message).toContain('...');
    });
  });
});

