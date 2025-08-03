import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Bell, BellOff } from 'lucide-react';

const NotificationSystem: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    
    // Check current permission status
    if ('Notification' in window) {
      setIsSubscribed(Notification.permission === 'granted');
    }

    // Set up real-time listeners for new messages
    if (user) {
      setupRealtimeListeners();
    }
  }, [user]);

  const setupRealtimeListeners = () => {
    if (!user) return;

    // Listen for new messages in chats where user is a participant
    const messagesChannel = supabase
      .channel('new-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=neq.${user.id}` // Don't notify for own messages
        },
        async (payload) => {
          // Check if user is in this chat
          const { data: participant } = await supabase
            .from('chat_participants')
            .select('*')
            .eq('chat_id', payload.new.chat_id)
            .eq('user_id', user.id)
            .single();

          if (participant) {
            // Get sender info
            const { data: sender } = await supabase
              .from('profiles')
              .select('name, avatar_url')
              .eq('user_id', payload.new.sender_id)
              .single();

            const senderName = sender?.name || 'Someone';
            
            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
              showBrowserNotification(
                `New message from ${senderName}`,
                payload.new.content || 'Sent an attachment',
                sender?.avatar_url
              );
            }
            
            // Show toast notification
            toast({
              title: `Message from ${senderName}`,
              description: payload.new.content || 'Sent an attachment',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  };

  const requestNotificationPermission = async () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support notifications",
        variant: "destructive",
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setIsSubscribed(permission === 'granted');
      
      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive notifications for new messages",
        });
      } else {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Error",
        description: "Failed to request notification permission",
        variant: "destructive",
      });
    }
  };

  const showBrowserNotification = (title: string, body: string, icon?: string) => {
    if (Notification.permission !== 'granted') return;

    const notification = new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'chat-message', // Prevents spam by replacing previous notifications
      requireInteraction: false,
      silent: false,
    });

    // Auto-close notification after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    // Handle notification click
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  };

  const disableNotifications = () => {
    setIsSubscribed(false);
    toast({
      title: "Notifications Disabled",
      description: "You won't receive browser notifications anymore",
    });
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {!isSubscribed ? (
        <Button
          variant="outline"
          size="sm"
          onClick={requestNotificationPermission}
          className="flex items-center gap-2"
        >
          <Bell className="w-4 h-4" />
          Enable Notifications
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={disableNotifications}
          className="flex items-center gap-2"
        >
          <BellOff className="w-4 h-4" />
          Notifications On
        </Button>
      )}
    </div>
  );
};

export default NotificationSystem;