'use client';

import { useState } from 'react';
import { MessageCircle, Send, Loader2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/providers/AuthProvider';
import { messagingApi } from '@/lib/messaging-api';
import { useToast } from '@/components/ui/use-toast';

interface ContactRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUserId: string;
  targetUserName: string;
  postTitle?: string;
  postType?: string;
}

/**
 * Dialog für Kontaktanfragen
 * 
 * Wird angezeigt wenn User noch keinen Kontakt hat
 */
export function ContactRequestDialog({
  open,
  onOpenChange,
  targetUserId,
  targetUserName,
  postTitle,
  postType,
}: ContactRequestDialogProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill message based on post type
  const defaultMessage = postType === 'success_story'
    ? `Hallo ${targetUserName}! Ich habe deine Erfolgsgeschichte "${postTitle || ''}" gelesen und bin beeindruckt. Können wir uns austauschen?`
    : postType === 'workshop'
    ? `Hallo ${targetUserName}! Ich interessiere mich für den Workshop "${postTitle || ''}" und hätte gerne mehr Informationen.`
    : postTitle
    ? `Hallo ${targetUserName}! Ich habe deinen Post "${postTitle}" gelesen und würde gerne mit dir darüber sprechen.`
    : `Hallo ${targetUserName}! Ich habe deinen Beitrag gelesen und würde gerne mit dir in Kontakt treten.`;

  const handleSubmit = async () => {
    if (!token) {
      toast({
        title: 'Fehler',
        description: 'Bitte melde dich an, um Nachrichten zu senden.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await messagingApi.sendContactRequest(
        {
          toUserId: targetUserId,
          message: message || defaultMessage,
        },
        token
      );

      toast({
        title: 'Kontaktanfrage gesendet',
        description: `${targetUserName} wird benachrichtigt und kann deine Anfrage annehmen.`,
      });

      onOpenChange(false);
      setMessage('');
    } catch (error: any) {
      console.error('[Messaging] Failed to send contact request:', error);
      toast({
        title: 'Fehler',
        description: error.message || 'Kontaktanfrage konnte nicht gesendet werden.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#66dd99]" />
            Nachricht an {targetUserName}
          </DialogTitle>
          <DialogDescription>
            Du hast noch keinen Kontakt zu {targetUserName}. Sende eine Kontaktanfrage, um Nachrichten zu senden.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Nachricht (optional)</Label>
            <Textarea
              id="message"
              placeholder={defaultMessage}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Diese Nachricht wird mit deiner Kontaktanfrage gesendet.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#66dd99] hover:bg-[#44cc88] text-black"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Wird gesendet...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Kontaktanfrage senden
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

