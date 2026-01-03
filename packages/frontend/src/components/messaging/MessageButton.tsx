'use client';

import { useState } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { messagingApi } from '@/lib/messaging-api';
import { ContactRequestDialog } from './ContactRequestDialog';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const MESSAGING_API = process.env.NEXT_PUBLIC_MESSAGING_API_URL || 'https://messaging.mojo-institut.de';

interface MessageButtonProps {
  targetUserId: string;
  targetUserName: string;
  postTitle?: string;
  postType?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

/**
 * "Nachricht senden" Button für Community Posts
 * 
 * Prüft ob Kontakt existiert:
 * - Ja: Öffnet Direktnachricht
 * - Nein: Zeigt Kontaktanfrage-Dialog
 */
export function MessageButton({
  targetUserId,
  targetUserName,
  postTitle,
  postType,
  variant = 'ghost',
  size = 'sm',
  className,
}: MessageButtonProps) {
  const { token, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleClick = async () => {
    if (!isAuthenticated || !token) {
      toast({
        title: 'Anmeldung erforderlich',
        description: 'Bitte melde dich an, um Nachrichten zu senden.',
        variant: 'destructive',
      });
      return;
    }

    // Don't allow messaging yourself
    // Note: We'd need current user ID from AuthProvider for this check
    // For now, we'll skip this check

    setIsChecking(true);

    try {
      // Check if user can message (contact exists or can request)
      const canMessage = await messagingApi.canMessage(targetUserId, token);

      if (canMessage.canMessage) {
        // Contact exists - open direct message
        // Try to find existing conversation
        const conversations = await messagingApi.getConversations(token, 50);
        const directConversation = conversations.conversations.find(
          (c) =>
            c.type === 'DIRECT' &&
            c.participants.some((p) => p.userId === targetUserId)
        );

        if (directConversation) {
          // Open existing conversation
          window.open(`${MESSAGING_API}/chat/${directConversation.id}`, '_blank');
        } else {
          // Create new conversation
          try {
            const newConv = await messagingApi.createConversation(
              {
                type: 'DIRECT',
                participantIds: [targetUserId],
              },
              token
            );
            window.open(`${MESSAGING_API}/chat/${newConv.conversation.id}`, '_blank');
          } catch (error: any) {
            console.error('[Messaging] Failed to create conversation:', error);
            // Fallback: Show contact request dialog
            setShowDialog(true);
          }
        }
      } else if (canMessage.requiresApproval) {
        // Contact request needed
        setShowDialog(true);
      } else {
        // Cannot message (blocked, etc.)
        toast({
          title: 'Nachricht nicht möglich',
          description: canMessage.reason || 'Du kannst dieser Person keine Nachricht senden.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('[Messaging] Failed to check can message:', error);
      // On error, show contact request dialog as fallback
      setShowDialog(true);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={isChecking || !isAuthenticated}
        className={cn('gap-1.5', className)}
      >
        {isChecking ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Prüfe...
          </>
        ) : (
          <>
            <MessageCircle className="w-4 h-4" />
            Nachricht senden
          </>
        )}
      </Button>

      <ContactRequestDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        targetUserId={targetUserId}
        targetUserName={targetUserName}
        postTitle={postTitle}
        postType={postType}
      />
    </>
  );
}

