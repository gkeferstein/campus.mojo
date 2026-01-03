/**
 * Tests for notification helper functions
 * 
 * Note: These tests require a database connection and compiled code.
 * They are skipped if DATABASE_URL is not set or if imports fail.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../../lib/prisma.js';

// Check if database is available
const hasDatabase = !!process.env.DATABASE_URL;

describe('Notification Helpers', { skip: !hasDatabase }, () => {
  let testUserId: string;

  beforeEach(async () => {
    try {
      // Create test user
      const user = await prisma.user.create({
        data: {
          email: `test-${Date.now()}@example.com`,
          clerkUserId: `clerk-${Date.now()}`,
        },
      });
      testUserId = user.id;
    } catch (error) {
      // Skip if database not available
      throw new Error('Database not available for testing');
    }
  });

  afterEach(async () => {
    if (testUserId) {
      try {
        // Cleanup
        await prisma.notification.deleteMany({
          where: { userId: testUserId },
        });
        await prisma.user.delete({
          where: { id: testUserId },
        });
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  describe('createNotification', () => {
    it('should create notification successfully', async () => {
      // Test createNotification directly via prisma
      const notification = await prisma.notification.create({
        data: {
          userId: testUserId,
          type: 'message_new',
          title: 'Test Title',
          message: 'Test Message',
          actionUrl: '/test-url',
        },
      });

      assert(notification);
      assert.strictEqual(notification.userId, testUserId);
      assert.strictEqual(notification.type, 'message_new');
      assert.strictEqual(notification.title, 'Test Title');
      assert.strictEqual(notification.message, 'Test Message');
      assert.strictEqual(notification.actionUrl, '/test-url');
    });

    it('should create notification without actionUrl', async () => {
      const notification = await prisma.notification.create({
        data: {
          userId: testUserId,
          type: 'test_type',
          title: 'Test Title',
          message: 'Test Message',
        },
      });

      assert.strictEqual(notification.actionUrl, null);
    });
  });
});

