'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageCircle, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useMessaging } from '@/hooks/useMessaging';
import { messagingApi } from '@/lib/messaging-api';
import type { Conversation } from '@/types/messaging';
import { formatTimeAgo, getInitials, formatUnreadCount } from '@/types/messaging';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const MESSAGING_API = process.env.NEXT_PUBLIC_MESSAGING_API_URL || 'https://messaging.mojo-institut.de';

/**
 * Messaging Widget für Header
 * 
 * Zeigt:
 * - Icon mit Unread-Badge
 * - Dropdown mit 5 letzten Konversationen
 * - Online-Status
 * - Graceful Degradation bei Fehlern
 */
export function MessagingWidget() {
  const { token, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // WebSocket Hook (nur wenn Dropdown offen für Performance)
  const {
    isConnected,
    socket,
    setConversations: setWSConversations,
    setTotalUnread: setWSTotalUnread,
  } = useMessaging({
    token: token || null,
    enabled: isOpen && isAuthenticated, // Nur verbinden wenn Dropdown offen
  });

  // Load conversations from API
  const loadConversations = useCallback(async () => {
    if (!token || !isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await messagingApi.getConversations(token, 5);
      setConversations(data.conversations);
      setTotalUnread(data.totalUnread);

      // Sync with WebSocket state
      if (socket) {
        setWSConversations(data.conversations);
        setWSTotalUnread(data.totalUnread);
      }
    } catch (err: any) {
      console.error('[Messaging] Failed to load conversations:', err);
      setError('Nicht verfügbar');
      // Graceful Degradation: Widget ausblenden bei Fehler
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, socket, setWSConversations, setWSTotalUnread]);

  // Load on mount and when dropdown opens
  useEffect(() => {
    if (isAuthenticated && token) {
      loadConversations();
    }
  }, [isAuthenticated, token, loadConversations]);

  // Reload when dropdown opens
  useEffect(() => {
    if (isOpen && isAuthenticated && token) {
      loadConversations();
    }
  }, [isOpen, isAuthenticated, token, loadConversations]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Don't render if not authenticated or error
  if (!isAuthenticated || error) {
    return null;
  }

  // Sort conversations by updatedAt (newest first)
  const sortedConversations = [...conversations]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent transition-colors"
        aria-label={`Nachrichten${totalUnread > 0 ? ` (${totalUnread} ungelesen)` : ''}`}
      >
        <MessageCircle className="h-5 w-5" />
        
        {/* Unread Badge */}
        {totalUnread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#66dd99] px-1 text-[11px] font-medium text-black">
            {formatUnreadCount(totalUnread)}
          </span>
        )}
        
        {/* Offline Indicator */}
        {!isConnected && socket && (
          <span className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full bg-red-500" />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border bg-popover shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="text-sm font-semibold">Nachrichten</span>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-[#66dd99]" />
                </div>
              ) : sortedConversations.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Keine Nachrichten
                </div>
              ) : (
                sortedConversations.map((conv) => (
                  <ConversationItem key={conv.id} conversation={conv} />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t px-4 py-3 text-center">
              <a
                href={MESSAGING_API}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#66dd99] hover:underline"
              >
                Alle Nachrichten öffnen
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Conversation Item Component
 */
function ConversationItem({ conversation }: { conversation: Conversation }) {
  // Get other participant (not current user)
  const otherParticipant = conversation.participants.find(
    (p) => p.userId !== conversation.participants[0]?.userId
  ) || conversation.participants[0];

  const displayName = conversation.name || otherParticipant?.name || 'Unbekannt';
  const avatarUrl = conversation.avatarUrl || otherParticipant?.avatarUrl;
  const isOnline = otherParticipant?.isOnline || false;

  return (
    <a
      href={`${MESSAGING_API}/chat/${conversation.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 border-b px-4 py-3 hover:bg-accent transition-colors last:border-b-0"
    >
      {/* Avatar */}
      <div className="relative h-10 w-10 flex-shrink-0">
        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#66dd99]/10">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={displayName} 
              className="h-full w-full rounded-full object-cover" 
            />
          ) : (
            <span className="text-sm font-medium text-[#66dd99]">
              {getInitials(displayName)}
            </span>
          )}
        </div>
        {isOnline && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-popover bg-green-500" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className={cn(
            "truncate text-sm",
            conversation.unreadCount > 0 && "font-semibold"
          )}>
            {displayName}
          </span>
          <span className="text-xs text-muted-foreground ml-2">
            {formatTimeAgo(conversation.lastMessage?.createdAt)}
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {conversation.lastMessage?.content || 'Keine Nachrichten'}
        </p>
      </div>

      {/* Unread Badge */}
      {conversation.unreadCount > 0 && (
        <span className="flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#66dd99] text-xs font-medium text-black">
          {formatUnreadCount(conversation.unreadCount)}
        </span>
      )}
    </a>
  );
}

