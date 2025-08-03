import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical, 
  Send, 
  DollarSign,
  Smile,
  Mic
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AvatarWithStatus from "@/components/ui/avatar-with-status";
import { useAuth } from "@/hooks/useAuth";
import { useChat, Message as ChatMessage } from "@/hooks/useChat";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { MessageItem } from "@/components/MessageItem";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { FileUpload } from "@/components/FileUpload";
import VoiceInterface from "@/components/VoiceInterface";
import VideoCall from "@/components/VideoCall";
import NotificationSystem from "@/components/NotificationSystem";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    chats, 
    sendMessage: sendChatMessage, 
    sendFileMessage,
    sendVoiceMessage,
    markMessagesAsRead 
  } = useChat();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find the current chat
  const chat = chats.find(c => c.id === chatId);
  
  // Fetch messages for this chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId) return;
      
      setLoading(true);
      try {
        const { data: messagesData, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        // Get sender profiles for messages
        let messagesWithSenders: ChatMessage[] = [];
        if (messagesData) {
          const senderIds = [...new Set(messagesData.map(m => m.sender_id))];
          const { data: sendersData } = await supabase
            .from('profiles')
            .select('*')
            .in('user_id', senderIds);

          messagesWithSenders = messagesData.map(msg => ({
            ...msg,
            message_type: msg.message_type as 'text' | 'image' | 'voice' | 'payment',
            sender: sendersData?.find(s => s.user_id === msg.sender_id)
          }));
        }

        setMessages(messagesWithSenders || []);
        
        // Mark messages as read
        if (user) {
          await markMessagesAsRead(chatId);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatId, user]);

  // Set up real-time message subscription
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`messages:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          // Get sender profile for the new message
          const { data: senderData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', payload.new.sender_id)
            .single();

          const newMessage: ChatMessage = {
            id: payload.new.id,
            chat_id: payload.new.chat_id,
            sender_id: payload.new.sender_id,
            content: payload.new.content,
            message_type: payload.new.message_type as 'text' | 'image' | 'voice' | 'payment',
            media_url: payload.new.media_url,
            is_read: payload.new.is_read,
            created_at: payload.new.created_at,
            sender: senderData || undefined
          };

          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Chat not found</p>
      </div>
    );
  }

  const getChatDisplayInfo = () => {
    if (!chat) return { name: "Unknown", avatar: "", isOnline: false, subtitle: "" };
    
    if (chat.is_group) {
      return {
        name: chat.name || "Group Chat",
        avatar: "",
        isOnline: false,
        subtitle: `${chat.participants?.length || 0} members`
      };
    }
    
    const otherParticipant = chat.participants?.find(p => p.user_id !== user?.id);
    
    return {
      name: otherParticipant?.name || "Unknown User",
      avatar: otherParticipant?.avatar_url || "",
      isOnline: otherParticipant?.is_online || false,
      subtitle: otherParticipant?.is_online ? "Online" : otherParticipant?.last_seen || "Offline"
    };
  };

  const displayInfo = getChatDisplayInfo();

  const sendTextMessage = async () => {
    if (!message.trim() || !chatId) return;

    try {
      await sendChatMessage(chatId, message.trim());
      setMessage("");
      
      toast({
        title: "Message sent",
        description: "Your message has been delivered",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!chatId) return;

    setIsUploading(true);
    try {
      await sendFileMessage(chatId, file);
      toast({
        title: "File sent",
        description: "Your file has been uploaded and sent",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleVoiceRecording = async (audioBlob: Blob) => {
    if (!chatId) return;

    setIsUploading(true);
    try {
      await sendVoiceMessage(chatId, audioBlob);
      toast({
        title: "Voice message sent",
        description: "Your voice message has been sent",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send voice message",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePayment = () => {
    if (!chat) return;
    const otherParticipant = chat.participants?.find(p => p.user_id !== user?.id);
    navigate(`/pay/send?recipient=${otherParticipant?.name || 'Unknown'}&id=${otherParticipant?.user_id}`);
  };

  const handleCall = (type: 'voice' | 'video') => {
    if (type === 'video') {
      setShowVideoCall(true);
    } else {
      setShowVoiceInterface(true);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border shadow-soft">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <AvatarWithStatus
              name={displayInfo.name}
              avatar={displayInfo.avatar}
              isOnline={displayInfo.isOnline}
              size="sm"
            />
            
            <div>
              <h2 className="font-semibold text-foreground">{displayInfo.name}</h2>
              <p className="text-xs text-muted-foreground">{displayInfo.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <NotificationSystem />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleCall('voice')}
              className="rounded-full"
              title="AI Voice Chat"
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleCall('video')}
              className="rounded-full"
              title="Video Call"
            >
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-gradient-warm rounded-full p-6 mb-4">
              <Smile className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
            <p className="text-muted-foreground">Send a message to get the conversation started!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                isOwnMessage={msg.sender_id === user?.id}
              />
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-card text-card-foreground px-4 py-2 rounded-2xl rounded-bl-md shadow-soft">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            
            {isUploading && (
              <div className="flex justify-end">
                <div className="bg-gradient-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-br-md shadow-soft">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span className="text-sm">Uploading...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="sticky bottom-0 bg-card border-t border-border p-4">
        <div className="flex items-end space-x-2">
          <div className="flex space-x-1">
            <FileUpload
              onFileSelected={handleFileUpload}
              isDisabled={isUploading}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
              maxSize={10}
            />
            {!chat?.is_group && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handlePayment}
                disabled={isUploading}
                className="text-accent hover:bg-accent/10"
              >
                <DollarSign className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex-1 flex items-end space-x-2">
            <div className="flex-1">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
                disabled={isUploading}
                className="border-0 bg-muted/50 rounded-full focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>
            
            {message.trim() ? (
              <Button 
                onClick={sendTextMessage}
                size="icon"
                disabled={isUploading}
                className="bg-gradient-primary hover:bg-gradient-sunset shadow-warm rounded-full h-10 w-10"
              >
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <VoiceRecorder
                onVoiceRecorded={handleVoiceRecording}
                isDisabled={isUploading}
              />
            )}
          </div>
        </div>
      </div>

      {/* Video Call Dialog */}
      {showVideoCall && (
        <Dialog open={showVideoCall} onOpenChange={setShowVideoCall}>
          <DialogContent className="max-w-4xl w-full h-[80vh]">
            <DialogHeader>
              <DialogTitle>Video Call with {displayInfo.name}</DialogTitle>
            </DialogHeader>
            <VideoCall 
              chatId={chatId!} 
              onCallEnd={() => setShowVideoCall(false)} 
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Voice Interface Dialog */}
      {showVoiceInterface && (
        <Dialog open={showVoiceInterface} onOpenChange={setShowVoiceInterface}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>AI Voice Assistant</DialogTitle>
            </DialogHeader>
            <VoiceInterface onSpeakingChange={(speaking) => setIsTyping(speaking)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Chat;