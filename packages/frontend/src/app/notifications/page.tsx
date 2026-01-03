"use client";

import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, MessageCircle, Users, Calendar, Award, Zap, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

const MESSAGING_API = process.env.NEXT_PUBLIC_MESSAGING_API_URL || 'https://messaging.mojo-institut.de';

export default function NotificationsPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const loadNotifications = async () => {
    if (!token || !isAuthenticated) return;

    try {
      const data = await api.get('/notifications', { token });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      loadNotifications();
    }
  }, [isAuthenticated, token]);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!token) return;

    try {
      await api.post(`/notifications/${notificationId}/read`, {}, { token });
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;

    setIsMarkingAll(true);
    try {
      await api.post('/notifications/read-all', {}, { token });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Handle action URL
    if (notification.actionUrl) {
      // Check if it's a messaging notification
      if (notification.type === 'message_new' || notification.type === 'message_reply') {
        // Extract conversation ID from actionUrl (e.g., /chat/:id)
        const conversationId = notification.actionUrl.split('/chat/')[1];
        if (conversationId) {
          window.open(`${MESSAGING_API}/chat/${conversationId}`, '_blank');
          return;
        }
      }
      
      // Regular navigation
      router.push(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message_new':
      case 'message_reply':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'workshop_reminder':
        return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'badge_earned':
        return <Award className="w-5 h-5 text-amber-500" />;
      case 'checkin_reminder':
        return <Zap className="w-5 h-5 text-[#66dd99]" />;
      case 'streak_warning':
        return <Zap className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Bitte melde dich an, um Benachrichtigungen zu sehen.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Benachrichtigungen</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-slate-500 mt-1">
              {unreadCount} ungelesene {unreadCount === 1 ? 'Benachrichtigung' : 'Benachrichtigungen'}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll}
            className="gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            Alle als gelesen markieren
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Lade Benachrichtigungen...
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Keine Benachrichtigungen</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                !notification.isRead && "ring-2 ring-[#66dd99] bg-[#66dd99]/5"
              )}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "font-semibold text-slate-900",
                          !notification.isRead && "font-bold"
                        )}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          {new Date(notification.createdAt).toLocaleString("de-DE", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-[#66dd99]" />
                        )}
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

