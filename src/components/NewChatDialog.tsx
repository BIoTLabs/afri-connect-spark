import { useState } from "react";
import { Search, Users, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import AvatarWithStatus from "@/components/ui/avatar-with-status";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface NewChatDialogProps {
  children: React.ReactNode;
}

export const NewChatDialog = ({ children }: NewChatDialogProps) => {
  const { user } = useAuth();
  const { profiles, createChat } = useChat();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Filter contacts (exclude current user and search)
  const filteredContacts = profiles.filter(profile => {
    if (profile.user_id === user?.id) return false;
    if (!searchQuery) return true;
    return profile.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleContactToggle = (userId: string) => {
    setSelectedContacts(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateChat = async (isGroup: boolean = false) => {
    if (selectedContacts.length === 0) {
      toast({
        title: "No contacts selected",
        description: "Please select at least one contact to start a chat.",
        variant: "destructive",
      });
      return;
    }

    if (isGroup && selectedContacts.length < 2) {
      toast({
        title: "Insufficient contacts",
        description: "Group chats require at least 2 contacts.",
        variant: "destructive",
      });
      return;
    }

    if (isGroup && !groupName.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for the group chat.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const chat = await createChat(
        selectedContacts,
        isGroup,
        isGroup ? groupName.trim() : undefined
      );

      if (chat) {
        toast({
          title: "Chat created successfully",
          description: isGroup ? `Group "${groupName}" created` : "New chat started",
        });
        
        // Reset form and close dialog
        setSelectedContacts([]);
        setGroupName("");
        setSearchQuery("");
        setOpen(false);
        
        // Navigate to the new chat
        navigate(`/chat/${chat.id}`);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: "Failed to create chat",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Chat</DialogTitle>
          <DialogDescription>
            Select contacts to start a conversation or create a group chat.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="contacts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contacts">Direct Chat</TabsTrigger>
            <TabsTrigger value="group">Group Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Contact List */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No contacts found</p>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => {
                      setSelectedContacts([contact.user_id]);
                      handleCreateChat(false);
                    }}
                  >
                    <AvatarWithStatus
                      name={contact.name}
                      avatar={contact.avatar_url}
                      isOnline={contact.is_online}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {contact.is_online ? "Online" : "Offline"}
                      </p>
                    </div>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="group" className="space-y-4">
            {/* Group Name */}
            <Input
              placeholder="Group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Selected Contacts Count */}
            {selectedContacts.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
              </p>
            )}

            {/* Contact List with Checkboxes */}
            <div className="max-h-48 overflow-y-auto space-y-2">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No contacts found</p>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => handleContactToggle(contact.user_id)}
                  >
                    <Checkbox
                      checked={selectedContacts.includes(contact.user_id)}
                      onChange={() => handleContactToggle(contact.user_id)}
                    />
                    <AvatarWithStatus
                      name={contact.name}
                      avatar={contact.avatar_url}
                      isOnline={contact.is_online}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {contact.is_online ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Create Group Button */}
            <Button
              onClick={() => handleCreateChat(true)}
              disabled={isCreating || selectedContacts.length < 2 || !groupName.trim()}
              className="w-full"
            >
              {isCreating ? "Creating..." : "Create Group Chat"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};