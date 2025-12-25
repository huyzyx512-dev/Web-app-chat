import type { ConversationParticipant } from "@/types/chat";
import UserAvatar from "./UserAvatar";
import { Ellipsis } from "lucide-react";

interface GroupChatAvatar {
  participants: ConversationParticipant[];
  type: "chat" | "sidebar";
}

const GroupChatAvatar = ({ participants, type }: GroupChatAvatar) => {
  const avatars = [];
  const limit = Math.min(participants.length, 4); // tối đa ảnh của 3 người

  for (let i = 0; i < limit; i++) {
    const member = participants[i];
    avatars.push(
      <UserAvatar
        key={i}
        type={type}
        name={member.user.displayName}
        avatarUrl={member.user.avatarUrl ?? undefined}
      />
    );
  }

  return (
    <div className="relative flex -space-x-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:ring-2">
      {avatars}
      {/*Nếu nhiều hơn 4 avatar thì render dấu ...*/}
      {participants.length > limit && (
        <div className="flex items-center z-10 justify-center size-8 rounded-full bg-muted ring-2 ring-background text-muted-foreground">
          <Ellipsis className="size-4" />
        </div>
      )}
    </div>
  );
};

export default GroupChatAvatar;
