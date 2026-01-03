'use client';

import { useState } from 'react';
import { MessageCircle, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { messagingApi } from '@/lib/messaging-api';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const MESSAGING_API = process.env.NEXT_PUBLIC_MESSAGING_API_URL || 'https://messaging.mojo-institut.de';

interface WorkshopGroupChatButtonProps {
  workshopId: string;
  workshopTitle: string;
  participantIds: string[];
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

/**
 * Button zum Öffnen/Erstellen eines Gruppen-Chats für Workshop-Teilnehmer
 * 
 * Erstellt oder öffnet eine GROUP-Konversation für alle Workshop-Teilnehmer
 */
export function WorkshopGroupChatButton({
  workshopId,
  workshopTitle,
  participantIds,
  variant = 'outline',
  size = 'default',
  className,
}: WorkshopGroupChatButtonProps) {
  const { token, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (!isAuthenticated || !token) {
      toast({
        title: 'Anmeldung erforderlich',
        description: 'Bitte melde dich an, um am Gruppen-Chat teilzunehmen.',
        variant: 'destructive',
      });
      return;
    }

    if (participantIds.length === 0) {
      toast({
        title: 'Keine Teilnehmer',
        description: 'Es sind noch keine Teilnehmer für diesen Workshop registriert.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Try to find existing group conversation for this workshop
      // Look for GROUP conversations with matching name (workshop title)
      const conversations = await messagingApi.getConversations(token, 100);
      const groupConversation = conversations.conversations.find(
        (c) =>
          c.type === 'GROUP' &&
          c.name === workshopTitle
      );

      if (groupConversation) {
        // Open existing conversation
        window.open(`${MESSAGING_API}/chat/${groupConversation.id}`, '_blank');
      } else {
        // Create new group conversation
        const newConv = await messagingApi.createConversation(
          {
            type: 'GROUP',
            name: workshopTitle,
            description: `Gruppen-Chat für Workshop: ${workshopTitle}`,
            participantIds: participantIds,
          },
          token
        );
        window.open(`${MESSAGING_API}/chat/${newConv.conversation.id}`, '_blank');
      }
    } catch (error: any) {
      console.error('[Messaging] Failed to open workshop group chat:', error);
      toast({
        title: 'Fehler',
        description: error.message || 'Gruppen-Chat konnte nicht geöffnet werden.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading || !isAuthenticated || participantIds.length === 0}
      className={cn('gap-2', className)}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Wird geladen...
        </>
      ) : (
        <>
          <Users className="w-4 h-4" />
          Gruppen-Chat
        </>
      )}
    </Button>
  );
}

