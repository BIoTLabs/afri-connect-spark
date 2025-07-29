import React from 'react';
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
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const downloadFile = async (mediaUrl: string, fileName: string) => {
    try {
      const { data } = await supabase.storage
        .from('chat-files')
        .download(mediaUrl.replace('chat-files/', ''));
      
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
        return message.media_url ? (
          <AudioPlayer audioUrl={message.media_url} className="max-w-xs" />
        ) : (
          <p className="text-muted-foreground italic">Voice message unavailable</p>
        );
      
      case 'image':
        return message.media_url ? (
          <div className="max-w-sm">
            <img 
              src={message.media_url} 
              alt="Shared image"
              className="rounded-lg max-w-full h-auto"
              loading="lazy"
            />
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground italic">Image unavailable</p>
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
        if (message.media_url && message.media_url.includes('chat-files/')) {
          const fileName = message.media_url.split('/').pop() || 'file';
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
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2 max-w-[70%]`}>
        {!isOwnMessage && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.sender?.avatar_url} />
            <AvatarFallback>
              {message.sender?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`${isOwnMessage ? 'mr-2' : 'ml-2'}`}>
          {!isOwnMessage && (
            <div className="text-xs text-muted-foreground mb-1">
              {message.sender?.name}
            </div>
          )}
          
          <div className={`
            rounded-lg px-3 py-2 max-w-full
            ${isOwnMessage 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted'
            }
          `}>
            {renderMessageContent()}
          </div>
          
          <div className={`text-xs text-muted-foreground mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
            {formatTime(message.created_at)}
          </div>
        </div>
      </div>
    </div>
  );
};