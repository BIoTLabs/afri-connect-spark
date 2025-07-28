import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AvatarWithStatus from "@/components/ui/avatar-with-status";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

const ChatList = () => {
  const { user, signOut } = useAuth();
  const { chats, profiles, loading } = useChat();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter chats based on search
  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    
    if (chat.is_group && chat.name) {
      return chat.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    const otherParticipant = chat.participants?.find(p => p.user_id !== user?.id);
    return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diff = now.getTime() - messageTime.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else if (days === 1) {
      return "Yesterday";
    } else {
      return messageTime.toLocaleDateString();
    }
  };

  const getChatDisplayInfo = (chat: any) => {
    if (chat.is_group) {
      return {
        name: chat.name || "Group Chat",
        avatar: "",
        isOnline: false
      };
    }
    
    const otherParticipant = chat.participants?.find((p: any) => p.user_id !== user?.id);
    
    return {
      name: otherParticipant?.name || "Unknown User",
      avatar: otherParticipant?.avatar_url || "",
      isOnline: otherParticipant?.is_online || false
    };
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border shadow-soft">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Afri-Connect
              </h1>
              <p className="text-sm text-muted-foreground">Stay connected, grow together</p>
            </div>
            
            <Button 
              size="icon" 
              onClick={signOut}
              variant="outline"
              className="rounded-full"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-0 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No chats found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? "Try a different search term" : "Start a conversation with someone"}
            </p>
            <Button className="bg-gradient-primary hover:bg-gradient-sunset shadow-warm">
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredChats.map((chat) => {
              const displayInfo = getChatDisplayInfo(chat);
              
              return (
                <Link
                  key={chat.id}
                  to={`/chat/${chat.id}`}
                  className="flex items-center space-x-4 p-3 rounded-xl hover:bg-muted/50 transition-colors duration-200 active:scale-95"
                >
                  <AvatarWithStatus
                    name={displayInfo.name}
                    avatar={displayInfo.avatar}
                    isOnline={displayInfo.isOnline}
                    size="md"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {displayInfo.name}
                      </h3>
                       {chat.last_message && (
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(chat.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate flex-1">
                        {chat.last_message?.content || "No messages yet"}
                      </p>
                      
                      {chat.unread_count && chat.unread_count > 0 && (
                        <div className="ml-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                          {chat.unread_count > 99 ? "99+" : chat.unread_count}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;