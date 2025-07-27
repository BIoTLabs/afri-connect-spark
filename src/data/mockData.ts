// Mock data for the entire application

export interface User {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'image' | 'voice' | 'payment';
  mediaUrl?: string;
}

export interface Chat {
  id: string;
  participants: string[];
  isGroup: boolean;
  name?: string;
  lastMessage?: Message;
  unreadCount: number;
  messages: Message[];
}

export interface Transaction {
  id: string;
  type: 'sent' | 'received' | 'bill' | 'airtime';
  amount: number;
  recipient?: string;
  sender?: string;
  description: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  currency: string;
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Aisha Musa",
    phone: "+234 901 234 5678",
    avatar: "",
    isOnline: true
  },
  {
    id: "2", 
    name: "Kwame Nkrumah",
    phone: "+233 245 678 901",
    avatar: "",
    isOnline: false,
    lastSeen: "2 hours ago"
  },
  {
    id: "3",
    name: "Mama Nkechi (Shop)",
    phone: "+234 803 456 7890",
    avatar: "",
    isOnline: true
  },
  {
    id: "4",
    name: "Community Group",
    phone: "",
    avatar: "",
    isOnline: true
  },
  {
    id: "5",
    name: "Fatima Al-Zahra",
    phone: "+221 776 234 567",
    avatar: "",
    isOnline: false,
    lastSeen: "Yesterday"
  },
  {
    id: "6",
    name: "Chidi Okafor",
    phone: "+234 705 890 1234",
    avatar: "",
    isOnline: true
  }
];

// Mock Messages
export const mockMessages: Message[] = [
  {
    id: "msg1",
    senderId: "1",
    content: "Hello! How are you doing today?",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    isRead: true,
    type: 'text'
  },
  {
    id: "msg2", 
    senderId: "current_user",
    content: "I'm doing great! Thanks for asking. How about you?",
    timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
    isRead: true,
    type: 'text'
  },
  {
    id: "msg3",
    senderId: "1",
    content: "All good here! Did you receive the payment I sent earlier?",
    timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
    isRead: true,
    type: 'text'
  }
];

// Mock Chats
export const mockChats: Chat[] = [
  {
    id: "chat1",
    participants: ["current_user", "1"],
    isGroup: false,
    lastMessage: mockMessages[2],
    unreadCount: 0,
    messages: mockMessages
  },
  {
    id: "chat2",
    participants: ["current_user", "2"],
    isGroup: false,
    lastMessage: {
      id: "msg4",
      senderId: "2",
      content: "See you tomorrow for the meeting!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isRead: false,
      type: 'text'
    },
    unreadCount: 1,
    messages: []
  },
  {
    id: "chat3",
    participants: ["current_user", "3"],
    isGroup: false,
    lastMessage: {
      id: "msg5",
      senderId: "current_user",
      content: "Thank you for the groceries!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      isRead: true,
      type: 'text'
    },
    unreadCount: 0,
    messages: []
  },
  {
    id: "chat4",
    participants: ["current_user", "4", "5", "6"],
    isGroup: true,
    name: "Community Group",
    lastMessage: {
      id: "msg6",
      senderId: "5",
      content: "Don't forget about tomorrow's community meeting at 3 PM",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // Yesterday
      isRead: true,
      type: 'text'
    },
    unreadCount: 3,
    messages: []
  }
];

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: "txn1",
    type: "sent",
    amount: 5000,
    recipient: "Aisha Musa",
    description: "Lunch money",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    status: "completed",
    currency: "₦"
  },
  {
    id: "txn2",
    type: "received", 
    amount: 2500,
    sender: "Kwame Nkrumah",
    description: "Payment for services",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    status: "completed",
    currency: "₦"
  },
  {
    id: "txn3",
    type: "bill",
    amount: 8500,
    description: "Electricity Bill - PHCN",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // Yesterday
    status: "completed",
    currency: "₦"
  },
  {
    id: "txn4",
    type: "airtime",
    amount: 1000,
    description: "MTN Airtime",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    status: "completed",
    currency: "₦"
  }
];

// Mock Balance
export const mockBalance = 15750;