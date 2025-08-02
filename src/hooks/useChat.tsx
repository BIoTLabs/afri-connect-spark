import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  is_online: boolean;
  last_seen: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'voice' | 'payment';
  media_url?: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
}

export interface Chat {
  id: string;
  is_group: boolean;
  name?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  participants?: Profile[];
  messages?: Message[];
  last_message?: Message;
  unread_count?: number;
}

export const useChat = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's chats
  const fetchChats = async () => {
    if (!user) return;

    try {
      // Get chats where user is a participant
      const { data: userChats, error: chatsError } = await supabase
        .from('chats')
        .select(`
          *,
          chat_participants!inner(user_id)
        `)
        .eq('chat_participants.user_id', user.id)
        .order('updated_at', { ascending: false });

      if (chatsError) throw chatsError;

      // Process chats to add last message and unread count
      const processedChats = await Promise.all(
        (userChats || []).map(async (chat) => {
          // Get participants with their profiles
          const { data: participantData } = await supabase
            .from('chat_participants')
            .select('user_id')
            .eq('chat_id', chat.id);

          let participants: Profile[] = [];
          if (participantData) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .in('user_id', participantData.map(p => p.user_id));
            participants = profileData || [];
          }

          // Get last message
          const { data: lastMessages } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1);

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', chat.id)
            .neq('sender_id', user.id)
            .eq('is_read', false);

          return {
            ...chat,
            participants,
            last_message: lastMessages?.[0] as Message || null,
            unread_count: unreadCount || 0,
          };
        })
      );

      setChats(processedChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all profiles for contact list
  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  // Send a message
  const sendMessage = async (
    chatId: string, 
    content: string, 
    messageType: 'text' | 'image' | 'voice' | 'payment' = 'text',
    mediaUrl?: string
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          content,
          message_type: messageType,
          media_url: mediaUrl,
        })
        .select()
        .single();

      if (error) throw error;

      // Update chat's updated_at timestamp
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  // Upload file to storage
  const uploadFile = async (file: File, bucket: 'chat-files' | 'voice-messages'): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  // Send file message
  const sendFileMessage = async (chatId: string, file: File, content?: string) => {
    try {
      const mediaUrl = await uploadFile(file, 'chat-files');
      const messageType = file.type.startsWith('image/') ? 'image' : 'text';
      
      return await sendMessage(chatId, content || file.name, messageType, mediaUrl);
    } catch (error) {
      console.error('Error sending file message:', error);
      throw error;
    }
  };

  // Send voice message
  const sendVoiceMessage = async (chatId: string, audioBlob: Blob) => {
    try {
      const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, {
        type: 'audio/webm'
      });
      
      const mediaUrl = await uploadFile(audioFile, 'voice-messages');
      
      return await sendMessage(chatId, 'Voice message', 'voice', mediaUrl);
    } catch (error) {
      console.error('Error sending voice message:', error);
      throw error;
    }
  };

  // Create a new chat
  const createChat = async (participantIds: string[], isGroup: boolean = false, name?: string) => {
    console.log('createChat called with:', { participantIds, isGroup, name, userId: user?.id });
    
    if (!user) {
      console.log('No user found, cannot create chat');
      return;
    }

    try {
      // Create chat
      console.log('Creating chat in database...');
      
      // Get current auth user to ensure RLS policy compliance
      const { data: { user: authUser } } = await supabase.auth.getUser();
      console.log('Auth user:', authUser?.id, 'Hook user:', user.id);
      
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert({
          is_group: isGroup,
          name,
          created_by: authUser?.id || user.id,
        })
        .select()
        .single();

      if (chatError) {
        console.log('Chat creation error:', chatError);
        throw chatError;
      }

      console.log('Chat created successfully:', chat);

      // Add participants (including creator)
      const participants = [user.id, ...participantIds.filter(id => id !== user.id)];
      console.log('Adding participants:', participants);
      
      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert(
          participants.map(userId => ({
            chat_id: chat.id,
            user_id: userId,
          }))
        );

      if (participantsError) {
        console.log('Participants creation error:', participantsError);
        throw participantsError;
      }

      console.log('Participants added successfully');
      await fetchChats(); // Refresh chats
      console.log('Chat creation completed successfully');
      return chat;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (chatId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('chat_id', chatId)
        .neq('sender_id', user.id);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchChats();
      fetchProfiles();
    }
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchChats(); // Refresh chats when new message arrives
        }
      )
      .subscribe();

    // Subscribe to chat updates
    const chatsSubscription = supabase
      .channel('chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
        },
        () => {
          fetchChats(); // Refresh chats on any chat update
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(chatsSubscription);
    };
  }, [user]);

  return {
    chats,
    profiles,
    loading,
    sendMessage,
    sendFileMessage,
    sendVoiceMessage,
    createChat,
    markMessagesAsRead,
    fetchChats,
  };
};