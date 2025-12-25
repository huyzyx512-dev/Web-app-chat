// User cơ bản (dùng trong participants, lastMessageSender, seenBy)
export interface User {
  id: number;
  displayName: string;
  avatarUrl?: string | null;
}

// Participant trong conversation
export interface ConversationParticipant {
  userId: number;
  conversationId: number;
  user: User;
}

export interface SeenUser {
  id: string;
  displayName?: string;
  avatarUrl?: string | null;
}

export interface Group {
  name: string;
  createdBy: string;
}

export interface LastMessage {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
  };
}

// Conversation chính
export interface Conversation {
  id: number;
  type: "direct" | "group";

  // Tên group (direct thì null)
  groupName: string | null;

  // Last message
  lastMessageAt: string | null;
  lastMessageContent: string | null;
  lastMessageSenderId: number | null;
  lastMessageSender: User | null;

  // Số lượng unread theo userId
  unreadCounts: Record<string, number>;

  // Danh sách người tham gia
  allParticipants: ConversationParticipant[];

  // Ai đã xem
  seenBy: User[];

  // Thời gian tạo, cập nhật
  createdAt: string;
  updatedAt: string;
}

export interface ConversationResponse {
  conversations: Conversation[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  imgUrl?: string | null;
  updatedAt?: string | null;
  createdAt: string;
  isOwn?: boolean;
}
