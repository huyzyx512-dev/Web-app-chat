import { chatService } from "@/services/chatService";
import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      activeConversationId: null,
      convoLoading: false,
      messageLoading: false,
      setActiveConversation: (id) => set({ activeConversationId: id }),
      reset: () => {
        set({
          conversations: [],
          messages: {},
          activeConversationId: null,
          convoLoading: false,
          messageLoading: false,
        });
      },
      fetchConversations: async () => {
        try {
          set({ convoLoading: true });
          const { conversations } = await chatService.fetchConversations();

          set({ conversations, convoLoading: false });
        } catch (error) {
          console.error("Lỗi xảy ra khi fetchConversations", error);
          set({ convoLoading: false });
        }
      },
      fetchMessages: async (conversationId) => {
        const { activeConversationId, messages } = get();
        const { user } = useAuthStore.getState();

        const convoId = conversationId ?? activeConversationId;

        if (!convoId) return;

        const current = messages?.[convoId];
        const nextCursor =
          current?.nextCursor == undefined ? "" : current?.nextCursor;

        if (nextCursor === null) return;

        set({ messageLoading: true });

        try {
          const { messages: fetched, cursor } = await chatService.fetchMessage(
            convoId,
            nextCursor
          );

          const processed = fetched.map((m) => ({
            ...m,
            isOwn: m.senderId == user?.id.toString(),
          }));

          set((state) => {
            const prev = state.messages[convoId]?.items ?? [];
            const merged =
              prev.length > 0 ? [...processed, ...prev] : processed;

            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: merged,
                  hasMore: !!cursor,
                  nextCursor: cursor ?? null,
                },
              },
            };
          });
        } catch (error) {
          console.error("Lỗi xảy ra khi fetchMessages: ", error);
        } finally {
          set({ messageLoading: false });
        }
      },
      sendDirectMessage: async (recipientId, content, imgUrl) => {
        try {
          const { activeConversationId } = get();
          await chatService.sendDirectMessage(
            recipientId,
            content,
            imgUrl,
            activeConversationId || undefined
          );

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id.toString() === activeConversationId
                ? { ...c, seenBy: [] }
                : c
            ),
          }));
        } catch (error) {
          console.error("Lỗi xảy ra khi gửi direct message", error);
        }
      },
      sendGroupMessage: async (conversationId, content, imgUrl) => {
        try {
          await chatService.sendGroupMessage(conversationId, content, imgUrl);
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id.toString() === get().activeConversationId
                ? { ...c, seenBy: [] }
                : c
            ),
          }));
        } catch (error) {
          console.error("Lỗi xảy ra khi gửi group message", error);
        }
      },
      addMessage: async (message) => {
        try {
          const { user } = useAuthStore.getState();

          message.isOwn = String(message.senderId) === String(user?.id);

          const convoId = message.conversationId;

          // ✅ chỉ fetch nếu chưa có conversation
          if (!get().messages[convoId]) {
            await get().fetchMessages(convoId);
          }

          set((state) => {
            const prevItems = get().messages[convoId]?.items ?? [];
            if (prevItems.some((m) => m.id === message.id)) {
              return state;
            }

            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: [...prevItems, message],
                  hasMore: state.messages[convoId].hasMore,
                  nextCursor: state.messages[convoId].nextCursor ?? undefined,
                },
              },
            };
          });
        } catch (error) {
          console.error("Lỗi xảy ra khi add message: ", error);
        }
      },
      updateConversation: async (conversation) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversation.id ? { ...c, ...conversation } : c
          ),
        }));
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({ conversations: state.conversations }),
    }
  )
);
