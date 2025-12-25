import type { Conversation } from "@/types/chat";
import ChatCard from "./ChatCard";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";
import UnreadCountBadge from "./UnreadCountBadge";
import { useSocketStore } from "@/stores/useSocketStore";

const DirectMessageCard = ({ convo }: { convo: Conversation }) => {
  const { user } = useAuthStore();
  const { onlineUsers } = useSocketStore();
  const {
    activeConversationId,
    setActiveConversation,
    messages,
    fetchMessages,
  } = useChatStore();

  if (!user) return null;
  const otherUser = convo.allParticipants?.find((p) => p.userId !== user.id);

  if (!otherUser) return null;

  const unreadCount = convo.unreadCounts[user.id];
  const lastMessage = convo.lastMessageContent ?? "";

  const handleSelectConversation = async (id: string) => {
    setActiveConversation(id);
    if (!messages[id]) {
      await fetchMessages();
    }
  };

  return (
    <ChatCard
      convoId={convo.id}
      name={otherUser.user.displayName ?? ""}
      timestamp={
        convo.lastMessageAt ? new Date(convo.lastMessageAt) : undefined
      }
      isActive={activeConversationId === convo.id.toString()}
      onSelect={handleSelectConversation}
      unreadCount={unreadCount}
      leftSection={
        <>
          <UserAvatar
            type="sidebar"
            name={otherUser.user.displayName ?? ""}
            avatarUrl={otherUser.user.avatarUrl ?? ""}
          />
          <StatusBadge
            status={
              onlineUsers.includes(otherUser?.userId ?? -1)
                ? "online"
                : "offline"
            }
          />
          {unreadCount > 0 && <UnreadCountBadge unreadCount={unreadCount} />}
        </>
      }
      subtitle={
        <p
          className={cn(
            "text-sm truncate",
            unreadCount > 0
              ? "font-medium text-foreground"
              : "text-muted-foreground"
          )}
        >
          {lastMessage}
        </p>
      }
    />
  );
};

export default DirectMessageCard;
