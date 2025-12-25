import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";
import type { SocketState } from "@/types/store";
import { useChatStore } from "./useChatStore";

const baseURL = import.meta.env.VITE_SOCKET_URL;

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  onlineUsers: [],

  connectSocket: () => {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) return;

    const existingSocket = get().socket;
    if (existingSocket?.connected) return; // tránh tạo nhiều socket

    const socket: Socket = io(baseURL, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    set({ socket });

    socket.on("connect", () => {
      console.log("Đã kết nối với socket");
    });

    // online users
    socket.on("online-users", (userIds) => {
      set({ onlineUsers: userIds });
    });

    //new message
    socket.on("new-message", ({ message, conversation, unreadCounts }) => {
      useChatStore.getState().addMessage(message);

      const lastMessage = {
        // id: conversation.lastMessage.id,
        content: conversation.lastMessageContent,
        createAt: conversation.lastMessageCreatedAt,
        sender: {
          id: message.senderId,
          displayName: "",
          avatarUrl: null,
        },
      };

      const updatedConversation = {
        ...conversation,
        lastMessage,
        unreadCounts,
      };
      if (
        useChatStore.getState().activeConversationId === message.conversationId
      ) {
        // TODO: đánh dấu đã đọc
        // TODO: hiển thị tin nhắn lastMessage khi vào conversation
        // TODO: khi nhắn tin nhắn thì hiển thị cuối không phải roll xuống
      }

      useChatStore.getState().updateConversation(updatedConversation);
    });
  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
