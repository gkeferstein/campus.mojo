/**
 * MOJO Messaging API Client
 * 
 * Client für messaging.mojo REST API
 * Siehe: https://messaging.mojo-institut.de/api/v1
 */

const MESSAGING_API = process.env.NEXT_PUBLIC_MESSAGING_API_URL || 'https://messaging.mojo-institut.de';

import type {
  ConversationsResponse,
  ConversationResponse,
  MessagesResponse,
  UnreadResponse,
  CanMessageResponse,
  CreateConversationRequest,
  SendMessageRequest,
  SendContactRequestRequest,
  ContactRequest,
} from '@/types/messaging';

class MessagingApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'MessagingApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${MESSAGING_API}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new MessagingApiError(response.status, error.error || 'Request failed');
  }

  return response.json();
}

export const messagingApi = {
  /**
   * Get all conversations for the authenticated user
   */
  getConversations: (token: string, limit = 50, cursor?: string): Promise<ConversationsResponse> => {
    const params = new URLSearchParams();
    if (limit) params.set('limit', String(limit));
    if (cursor) params.set('cursor', cursor);
    
    return request<ConversationsResponse>(
      `/api/v1/conversations?${params.toString()}`,
      { method: 'GET' },
      token
    );
  },

  /**
   * Get a single conversation
   */
  getConversation: (conversationId: string, token: string): Promise<ConversationResponse> => {
    return request<ConversationResponse>(
      `/api/v1/conversations/${conversationId}`,
      { method: 'GET' },
      token
    );
  },

  /**
   * Create a new conversation
   */
  createConversation: (data: CreateConversationRequest, token: string): Promise<ConversationResponse> => {
    return request<ConversationResponse>(
      '/api/v1/conversations',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
  },

  /**
   * Get messages for a conversation
   */
  getMessages: (conversationId: string, token: string, limit = 50, cursor?: string): Promise<MessagesResponse> => {
    const params = new URLSearchParams();
    if (limit) params.set('limit', String(limit));
    if (cursor) params.set('cursor', cursor);
    
    return request<MessagesResponse>(
      `/api/v1/conversations/${conversationId}/messages?${params.toString()}`,
      { method: 'GET' },
      token
    );
  },

  /**
   * Send a message (REST fallback if WebSocket unavailable)
   */
  sendMessage: (conversationId: string, data: SendMessageRequest, token: string): Promise<{ message: any }> => {
    return request<{ message: any }>(
      `/api/v1/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
  },

  /**
   * Get unread message count
   */
  getUnreadCount: (token: string): Promise<UnreadResponse> => {
    return request<UnreadResponse>(
      '/api/v1/messages/unread',
      { method: 'GET' },
      token
    );
  },

  /**
   * Check if user can message another user
   */
  canMessage: (userId: string, token: string): Promise<CanMessageResponse> => {
    return request<CanMessageResponse>(
      `/api/v1/contacts/can-message/${userId}`,
      { method: 'GET' },
      token
    );
  },

  /**
   * Send a contact request
   */
  sendContactRequest: (data: SendContactRequestRequest, token: string): Promise<{ request: ContactRequest }> => {
    return request<{ request: ContactRequest }>(
      '/api/v1/contacts/requests',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
  },

  /**
   * Get contact requests
   */
  getContactRequests: (token: string): Promise<{ requests: ContactRequest[] }> => {
    return request<{ requests: ContactRequest[] }>(
      '/api/v1/contacts/requests',
      { method: 'GET' },
      token
    );
  },
};

export { MessagingApiError };

