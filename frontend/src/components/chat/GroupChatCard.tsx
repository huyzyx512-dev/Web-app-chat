import type { Conversation } from "@/types/chat";
import ChatCard from "./ChatCard";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import UnreadCountBadge from "./UnreadCountBadge";
import GroupChatAvatar from "./GroupChatAvatar";

const GroupChatCard = ({ convo }: { convo: Conversation }) => {
  const { user } = useAuthStore();
  const { activeConversationId, setActiveConversation, messages, fetchMessages } =
    useChatStore();

  if (!user) return null;

  const unreadCount = convo.unreadCounts[user.id];
  const name = convo.groupName ?? "";
  const handleSelectConversation = async (id: string) => {
    setActiveConversation(id);
    if (!messages[id]) {
      await fetchMessages();
    }
  };

  return (
    <ChatCard
      convoId={convo.id}
      name={name}
      timestamp={
        convo.lastMessageAt
          ? new Date(convo.lastMessageAt)
          : undefined
      }
      isActive={activeConversationId === convo.id.toString()}
      onSelect={handleSelectConversation}
      unreadCount={unreadCount}
      leftSection={<>
        {unreadCount > 0 && <UnreadCountBadge unreadCount={unreadCount}/>}
        <GroupChatAvatar participants={convo.allParticipants} type="chat"/>
      </>}
      subtitle={
        <p className="text-sm truncate text-muted-foreground">{convo.allParticipants.length} thành viên</p>
      }
    />
  );
};

export default GroupChatCard;
