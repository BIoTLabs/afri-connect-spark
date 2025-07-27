import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical, 
  Send, 
  Paperclip, 
  Mic, 
  Image,
  DollarSign,
  Smile
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AvatarWithStatus from "@/components/ui/avatar-with-status";
import { mockChats, mockUsers, mockMessages, Message } from "@/data/mockData";
import { cn } from "@/lib/utils";

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find the current chat
  const chat = mockChats.find(c => c.id === chatId);
  
  useEffect(() => {
    if (chat) {
      // Load messages for this chat (using mock data)
      if (chat.id === "chat1") {
        setMessages(mockMessages);
      } else {
        setMessages([]);
      }
    }
  }, [chat]);

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
    if (chat.isGroup) {
      return {
        name: chat.name || "Group Chat",
        avatar: "",
        isOnline: false,
        subtitle: `${chat.participants.length} members`
      };
    }
    
    const otherParticipantId = chat.participants.find(id => id !== "current_user");
    const otherUser = mockUsers.find(user => user.id === otherParticipantId);
    
    return {
      name: otherUser?.name || "Unknown User",
      avatar: otherUser?.avatar || "",
      isOnline: otherUser?.isOnline || false,
      subtitle: otherUser?.isOnline ? "Online" : otherUser?.lastSeen || "Offline"
    };
  };

  const displayInfo = getChatDisplayInfo();

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: "current_user",
      content: message.trim(),
      timestamp: new Date(),
      isRead: false,
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage("");

    // Simulate typing indicator and response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      // Simulate a response for demo purposes
      if (Math.random() > 0.5) {
        const responseMessage: Message = {
          id: `msg_${Date.now() + 1}`,
          senderId: chat.participants.find(id => id !== "current_user") || "1",
          content: getRandomResponse(),
          timestamp: new Date(),
          isRead: false,
          type: 'text'
        };
        setMessages(prev => [...prev, responseMessage]);
      }
    }, 2000);

    toast({
      title: "Message sent",
      description: "Your message has been delivered",
    });
  };

  const getRandomResponse = () => {
    const responses = [
      "Thanks for your message!",
      "Got it, will get back to you soon.",
      "Sounds good!",
      "Let me check and respond.",
      "Thanks for letting me know."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handlePayment = () => {
    const otherParticipantId = chat.participants.find(id => id !== "current_user");
    const otherUser = mockUsers.find(user => user.id === otherParticipantId);
    
    navigate(`/pay/send?recipient=${otherUser?.name || 'Unknown'}&id=${otherParticipantId}`);
  };

  const formatMessageTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleMediaAction = (type: string) => {
    toast({
      title: "Feature coming soon",
      description: `${type} sharing will be available in the next update`,
    });
  };

  const handleCall = (type: 'voice' | 'video') => {
    toast({
      title: `${type === 'voice' ? 'Voice' : 'Video'} call`,
      description: `Initiating ${type} call with ${displayInfo.name}...`,
    });
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
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleCall('voice')}
              className="rounded-full"
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleCall('video')}
              className="rounded-full"
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
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-gradient-warm rounded-full p-6 mb-4">
              <Smile className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
            <p className="text-muted-foreground">Send a message to get the conversation started!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isCurrentUser = msg.senderId === "current_user";
              const sender = mockUsers.find(user => user.id === msg.senderId);
              
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    isCurrentUser ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] px-4 py-2 rounded-2xl shadow-soft",
                      isCurrentUser 
                        ? "bg-gradient-primary text-primary-foreground rounded-br-md" 
                        : "bg-card text-card-foreground rounded-bl-md"
                    )}
                  >
                    {!isCurrentUser && chat.isGroup && (
                      <p className="text-xs font-semibold mb-1 text-primary">
                        {sender?.name || "Unknown"}
                      </p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <div className={cn(
                      "flex items-center justify-end space-x-1 mt-1",
                      isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      <span className="text-xs">{formatMessageTime(msg.timestamp)}</span>
                      {isCurrentUser && (
                        <div className="flex">
                          <div className="w-1 h-1 bg-current rounded-full opacity-60" />
                          <div className={cn(
                            "w-1 h-1 bg-current rounded-full ml-0.5",
                            msg.isRead ? "opacity-100" : "opacity-60"
                          )} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
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
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="sticky bottom-0 bg-card border-t border-border p-4">
        <div className="flex items-end space-x-2">
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleMediaAction("Photo")}
              className="rounded-full h-8 w-8"
            >
              <Image className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleMediaAction("File")}
              className="rounded-full h-8 w-8"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            {!chat.isGroup && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handlePayment}
                className="rounded-full h-8 w-8 text-accent hover:bg-accent/10"
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
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="border-0 bg-muted/50 rounded-full focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>
            
            {message.trim() ? (
              <Button 
                onClick={sendMessage}
                size="icon"
                className="bg-gradient-primary hover:bg-gradient-sunset shadow-warm rounded-full h-10 w-10"
              >
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleMediaAction("Voice note")}
                className="rounded-full h-10 w-10"
              >
                <Mic className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;