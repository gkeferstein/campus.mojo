/**
 * Tests for messaging-api.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

const MOCK_TOKEN = 'test-token';
const MOCK_API_URL = 'http://localhost:3020';

// Set environment variable before importing
process.env.NEXT_PUBLIC_MESSAGING_API_URL = MOCK_API_URL;

// Import after setting env var
import { messagingApi, MessagingApiError } from '../messaging-api';

describe('messaging-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getConversations', () => {
    it('should fetch conversations successfully', async () => {
      const mockResponse = {
        conversations: [
          {
            id: 'conv-1',
            type: 'DIRECT',
            name: null,
            participants: [],
            lastMessage: null,
            unreadCount: 0,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        totalUnread: 0,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await messagingApi.getConversations(MOCK_TOKEN, 50);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/conversations?limit=50'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${MOCK_TOKEN}`,
            'Content-Type': 'application/json',
          }),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      await expect(
        messagingApi.getConversations(MOCK_TOKEN)
      ).rejects.toThrow(MessagingApiError);
    });
  });

  describe('canMessage', () => {
    it('should check if user can message another user', async () => {
      const mockResponse = {
        canMessage: true,
        requiresApproval: false,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await messagingApi.canMessage('user-123', MOCK_TOKEN);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/contacts/can-message/user-123'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${MOCK_TOKEN}`,
            'Content-Type': 'application/json',
          }),
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('sendContactRequest', () => {
    it('should send contact request', async () => {
      const mockRequest = {
        toUserId: 'user-123',
        message: 'Hello!',
      };

      const mockResponse = {
        request: {
          id: 'req-1',
          fromUserId: 'user-456',
          toUserId: 'user-123',
          message: 'Hello!',
          status: 'pending',
          createdAt: '2024-01-01T00:00:00Z',
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await messagingApi.sendContactRequest(mockRequest, MOCK_TOKEN);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/contacts/requests'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${MOCK_TOKEN}`,
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(mockRequest),
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('createConversation', () => {
    it('should create a new conversation', async () => {
      const mockRequest = {
        type: 'DIRECT' as const,
        participantIds: ['user-123'],
      };

      const mockResponse = {
        conversation: {
          id: 'conv-1',
          type: 'DIRECT',
          name: null,
          participants: [],
          lastMessage: null,
          unreadCount: 0,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await messagingApi.createConversation(mockRequest, MOCK_TOKEN);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/conversations'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${MOCK_TOKEN}`,
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(mockRequest),
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });
});

