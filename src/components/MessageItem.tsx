import React, { useState, useEffect } from 'react';
import { Message } from '@/hooks/useChat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AudioPlayer } from './AudioPlayer';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isOwnMessage }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Load signed URLs for media
  useEffect(() => {
    const loadMediaUrls = async () => {
      if (message.message_type === 'image' && message.media_url && !message.media_url.startsWith('http')) {
        const signedUrl = await getSignedUrl(message.media_url, 'chat-files');
        setImageUrl(signedUrl);
      } else if (message.message_type === 'image' && message.media_url?.startsWith('http')) {
        setImageUrl(message.media_url);
      }

      if (message.message_type === 'voice' && message.media_url && !message.media_url.startsWith('http')) {
        const signedUrl = await getSignedUrl(message.media_url, 'voice-messages');
        setVoiceUrl(signedUrl);
      } else if (message.message_type === 'voice' && message.media_url?.startsWith('http')) {
        setVoiceUrl(message.media_url);
      }
    };

    loadMediaUrls();
  }, [message.media_url, message.message_type]);

  const downloadFile = async (mediaUrl: string, fileName: string) => {
    try {
      // For private storage, extract the file path
      const filePath = mediaUrl.startsWith('http') 
        ? mediaUrl.split('/').slice(-2).join('/') // Extract user_id/filename from URL
        : mediaUrl; // Already a file path
        
      const { data } = await supabase.storage
        .from('chat-files')
        .download(filePath);
      
      if (data) {
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const getSignedUrl = async (filePath: string, bucket: 'chat-files' | 'voice-messages' = 'chat-files') => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 3600); // 1 hour expiry
      
      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'mp4':
      case 'mov':
        return '🎥';
      case 'mp3':
      case 'wav':
        return '🎵';
      default:
        return '📎';
    }
  };

  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'voice':
        return voiceUrl ? (
          <AudioPlayer audioUrl={voiceUrl} className="max-w-xs" />
        ) : (
          <p className="text-muted-foreground italic">Loading voice message...</p>
        );
      
      case 'image':
        return imageUrl ? (
          <div className="max-w-xs sm:max-w-sm md:max-w-md">
            <img 
              src={imageUrl} 
              alt="Shared image"
              className="rounded-lg w-full h-auto max-h-96 object-cover"
              loading="lazy"
              onClick={() => window.open(imageUrl, '_blank')}
              style={{ cursor: 'pointer' }}
            />
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground italic">Loading image...</p>
        );
      
      case 'payment':
        return (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <span className="text-green-600 dark:text-green-400">💰</span>
              <span className="font-medium text-green-800 dark:text-green-200">
                Payment: {message.content}
              </span>
            </div>
          </div>
        );
      
      default:
        // Handle file attachments for text messages
        if (message.media_url) {
          const fileName = message.content || message.media_url.split('/').pop() || 'file';
          return (
            <div className="space-y-2">
              {message.content && <p>{message.content}</p>}
              <div className="bg-muted rounded-lg p-3 flex items-center justify-between max-w-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getFileIcon(fileName)}</span>
                  <span className="text-sm font-medium truncate">{fileName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadFile(message.media_url!, fileName)}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        }
        return <p>{message.content}</p>;
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 px-2 sm:px-0 message-bubble`}>
      <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2 max-w-[85%] sm:max-w-[70%]`}>
        {!isOwnMessage && (
          <Avatar className="h-8 w-8 ring-2 ring-background shadow-soft">
            <AvatarImage src={message.sender?.avatar_url} />
            <AvatarFallback className="bg-gradient-warm text-white font-medium">
              {message.sender?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`${isOwnMessage ? 'mr-2' : 'ml-2'}`}>
          {!isOwnMessage && (
            <div className="text-xs text-muted-foreground mb-1 font-medium">
              {message.sender?.name}
            </div>
          )}
          
          <div className={`
            rounded-2xl px-4 py-3 max-w-full shadow-soft backdrop-blur-sm transition-all duration-200 hover:shadow-warm
            ${isOwnMessage 
              ? 'bg-gradient-primary text-primary-foreground rounded-br-md' 
              : 'bg-card/80 backdrop-blur-sm border border-border/50 rounded-bl-md'
            }
          `}>
            {renderMessageContent()}
          </div>
          
          <div className={`text-xs text-muted-foreground/70 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
            {formatTime(message.created_at)}
          </div>
        </div>
      </div>
    </div>
  );
};