'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  Conversation,
  Message,
} from '@/types/messaging';

const MESSAGING_WS = process.env.NEXT_PUBLIC_MESSAGING_WS_URL || 'wss://messaging.mojo-institut.de';

interface UseMessagingOptions {
  token: string | null;
  tenantId?: string;
  enabled?: boolean; // Nur verbinden wenn enabled
}

/**
 * React Hook für messaging.mojo WebSocket
 * 
 * Features:
 * - Automatische Verbindung/Reconnection
 * - Typed Events
 * - Graceful Degradation
 */
export function useMessaging({ token, tenantId, enabled = true }: UseMessagingOptions) {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const typingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // WebSocket Connection
  useEffect(() => {
    if (!token || !enabled) {
      setSocket(null);
      setIsConnected(false);
      return;
    }

    let ws: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

    try {
      ws = io(MESSAGING_WS, {
        auth: { token, tenantId },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      ws.on('connect', () => {
        console.log('[Messaging] WebSocket connected');
        setIsConnected(true);
      });

      ws.on('disconnect', (reason) => {
        console.log('[Messaging] WebSocket disconnected:', reason);
        setIsConnected(false);
      });

      ws.on('connect_error', (error) => {
        console.error('[Messaging] WebSocket connection error:', error.message);
        setIsConnected(false);
        // Nicht crashen, nur offline markieren
      });

      // Listen to new messages
      ws.on('message:new', ({ message, conversationId }) => {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessage: message,
                  unreadCount: c.unreadCount + 1,
                  updatedAt: new Date().toISOString(),
                }
              : c
          )
        );
        setTotalUnread((prev) => prev + 1);
      });

      // Listen to read receipts
      ws.on('messages:read', ({ userId, conversationId, readAt }) => {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  unreadCount: Math.max(0, c.unreadCount - 1),
                }
              : c
          )
        );
      });

      // Listen to presence updates
      ws.on('presence:online', ({ userId }) => {
        setConversations((prev) =>
          prev.map((c) => ({
            ...c,
            participants: c.participants.map((p) =>
              p.userId === userId ? { ...p, isOnline: true } : p
            ),
          }))
        );
      });

      ws.on('presence:offline', ({ userId, lastSeen }) => {
        setConversations((prev) =>
          prev.map((c) => ({
            ...c,
            participants: c.participants.map((p) =>
              p.userId === userId ? { ...p, isOnline: false, lastSeenAt: lastSeen } : p
            ),
          }))
        );
      });

      setSocket(ws);
    } catch (error) {
      console.error('[Messaging] Failed to create WebSocket:', error);
      setIsConnected(false);
    }

    return () => {
      if (ws) {
        ws.close();
      }
      // Cleanup typing timeouts
      typingTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      typingTimeoutsRef.current.clear();
    };
  }, [token, tenantId, enabled]);

  // Send message
  const sendMessage = useCallback(
    (conversationId: string, content: string, type: 'TEXT' | 'SYSTEM' | 'ATTACHMENT' = 'TEXT') => {
      if (!socket || !isConnected) {
        throw new Error('WebSocket not connected');
      }
      socket.emit('message:send', { conversationId, content, type });
    },
    [socket, isConnected]
  );

  // Start typing indicator
  const startTyping = useCallback(
    (conversationId: string) => {
      if (!socket || !isConnected) return;

      socket.emit('typing:start', { conversationId });

      // Auto-stop after 3 seconds
      const existingTimeout = typingTimeoutsRef.current.get(conversationId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      const timeout = setTimeout(() => {
        socket.emit('typing:stop', { conversationId });
        typingTimeoutsRef.current.delete(conversationId);
      }, 3000);

      typingTimeoutsRef.current.set(conversationId, timeout);
    },
    [socket, isConnected]
  );

  // Stop typing indicator
  const stopTyping = useCallback(
    (conversationId: string) => {
      if (!socket || !isConnected) return;

      socket.emit('typing:stop', { conversationId });

      const timeout = typingTimeoutsRef.current.get(conversationId);
      if (timeout) {
        clearTimeout(timeout);
        typingTimeoutsRef.current.delete(conversationId);
      }
    },
    [socket, isConnected]
  );

  // Mark messages as read
  const markAsRead = useCallback(
    (conversationId: string) => {
      if (!socket || !isConnected) return;

      socket.emit('messages:read', { conversationId });
      
      // Optimistic update
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c
        )
      );
      setTotalUnread((prev) => {
        const conv = conversations.find((c) => c.id === conversationId);
        return Math.max(0, prev - (conv?.unreadCount || 0));
      });
    },
    [socket, isConnected, conversations]
  );

  // Join conversation room
  const joinConversation = useCallback(
    (conversationId: string) => {
      if (!socket || !isConnected) return;
      socket.emit('conversation:join', { conversationId });
    },
    [socket, isConnected]
  );

  // Leave conversation room
  const leaveConversation = useCallback(
    (conversationId: string) => {
      if (!socket || !isConnected) return;
      socket.emit('conversation:leave', { conversationId });
    },
    [socket, isConnected]
  );

  return {
    socket,
    isConnected,
    conversations,
    totalUnread,
    setConversations,
    setTotalUnread,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    joinConversation,
    leaveConversation,
  };
}

