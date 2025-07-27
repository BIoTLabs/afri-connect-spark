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
  type: 'sent' | 'received' | 'bill' | 'airtime' | 'crypto-exchange' | 'cross-border';
  amount: number;
  recipient?: string;
  sender?: string;
  description: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  currency: string;
  cryptoType?: 'BTC' | 'ETH' | 'USDT' | 'BNB' | 'USDC' | 'XAF' | 'NGN' | 'KES';
  exchangeRate?: number;
  networkFee?: number;
}

// Mock Users - Pan-African Focus
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Aisha Musa",
    phone: "+234 901 234 5678", // Nigeria
    avatar: "",
    isOnline: true
  },
  {
    id: "2", 
    name: "Kwame Asante",
    phone: "+233 245 678 901", // Ghana
    avatar: "",
    isOnline: false,
    lastSeen: "2 hours ago"
  },
  {
    id: "3",
    name: "Amara Diallo",
    phone: "+221 776 234 567", // Senegal
    avatar: "",
    isOnline: true
  },
  {
    id: "4",
    name: "Kenzo Mbeki",
    phone: "+27 82 456 7890", // South Africa
    avatar: "",
    isOnline: true
  },
  {
    id: "5",
    name: "Zara Hassan",
    phone: "+254 722 345 678", // Kenya
    avatar: "",
    isOnline: false,
    lastSeen: "Yesterday"
  },
  {
    id: "6",
    name: "Pan-Africa Crypto Group",
    phone: "",
    avatar: "",
    isOnline: true
  },
  {
    id: "7",
    name: "Fatou Camara",
    phone: "+225 07 123 4567", // Côte d'Ivoire
    avatar: "",
    isOnline: true
  },
  {
    id: "8",
    name: "Omar El-Rashid",
    phone: "+20 100 234 5678", // Egypt
    avatar: "",
    isOnline: false,
    lastSeen: "3 hours ago"
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

// Mock Transactions - Crypto & Pan-African Focus
export const mockTransactions: Transaction[] = [
  {
    id: "txn1",
    type: "cross-border",
    amount: 0.15,
    recipient: "Kwame Asante (Ghana)",
    description: "Payment for web design",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    status: "completed",
    currency: "ETH",
    cryptoType: "ETH",
    networkFee: 0.002
  },
  {
    id: "txn2",
    type: "received", 
    amount: 500,
    sender: "Amara Diallo (Senegal)",
    description: "Freelance payment",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    status: "completed",
    currency: "USDT",
    cryptoType: "USDT"
  },
  {
    id: "txn3",
    type: "crypto-exchange",
    amount: 25000,
    description: "USDT → NGN Exchange",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    status: "completed",
    currency: "NGN",
    cryptoType: "NGN",
    exchangeRate: 1650
  },
  {
    id: "txn4",
    type: "sent",
    amount: 0.003,
    recipient: "Zara Hassan (Kenya)",
    description: "School fees contribution",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // Yesterday
    status: "completed",
    currency: "BTC",
    cryptoType: "BTC",
    networkFee: 0.0001
  },
  {
    id: "txn5",
    type: "cross-border",
    amount: 1200,
    recipient: "Kenzo Mbeki (South Africa)",
    description: "Business investment",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36), // 1.5 days ago
    status: "completed",
    currency: "USDC",
    cryptoType: "USDC"
  },
  {
    id: "txn6",
    type: "bill",
    amount: 15000,
    description: "Electricity Bill (via NGN)",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    status: "completed",
    currency: "NGN"
  }
];

// Mock Crypto Balances
export const mockCryptoBalances = {
  BTC: { amount: 0.025, usdValue: 1125 },
  ETH: { amount: 0.85, usdValue: 2040 },
  USDT: { amount: 2500, usdValue: 2500 },
  USDC: { amount: 1800, usdValue: 1800 },
  BNB: { amount: 3.2, usdValue: 768 }
};

// Mock FIAT Balance (Secondary)
export const mockFiatBalance = { NGN: 125000, USD: 150 };