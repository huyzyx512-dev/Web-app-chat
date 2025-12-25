import { cn, formatMessageTime } from "@/lib/utils";
import type {
  Conversation,
  ConversationParticipant,
  Message,
} from "@/types/chat";
import UserAvatar from "./UserAvatar";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

interface MessageItemProps {
  message: Message;
  index: number;
  messages: Message[];
  selectedConvo: Conversation;
  lastMessageStatus: "đã gửi" | "đã xem";
}

const MessageItem = ({
  message,
  index,
  messages,
  selectedConvo,
  lastMessageStatus,
}: MessageItemProps) => {
  const prev = messages[index - 1];
  const isGroupBreak =
    index === 0 ||
    message.senderId !== prev?.senderId ||
    new Date(message.createdAt).getTime() -
      new Date(prev?.createdAt || 0).getTime() >
      300000; // 5'

  const participant = selectedConvo.allParticipants.find(
    (p: ConversationParticipant) =>
      p.userId.toString() === message.senderId.toString()
  );
  return (
    <div
      className={cn(
        "flex gap-2 message-bounce",
        message.isOwn ? "justify-end" : "justify-start"
      )}
    >
      {/* avatar */}
      {!message.isOwn && (
        <div className="w-8">
          {isGroupBreak && (
            <UserAvatar
              type="chat"
              name={participant?.user.displayName ?? "Moji"}
              avatarUrl={participant?.user.avatarUrl ?? undefined}
            />
          )}
        </div>
      )}

      {/* tin nhawns */}
      <div
        className={cn(
          "max-w-xs lg:max-w-md space-y-1 flex flex-col",
          message.isOwn ? "items-end" : "items-start"
        )}
      >
        <Card
          className={cn(
            "p-3",
            message.isOwn
              ? "chat-bubble-sent border-0"
              : "bg-chat-bubble-received"
          )}
        >
          <p className="text-sm leading-relaxed break-words">
            {message.content}
          </p>
        </Card>

        {/* time */}
        {isGroupBreak && (
          <span className="text-xs text-muted-foreground px-1">
            {formatMessageTime(new Date(message.createdAt))}
          </span>
        )}

        {/* seen/ delivered */}
        {message.isOwn && (
          //   message.id === selectedConvo.lastMessageContent?.id &&
          <Badge
            variant="outline"
            className={cn(
              "text-xs px-1.5 py-0.5 h-4 border-0",
              lastMessageStatus === "đã xem"
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {lastMessageStatus}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
