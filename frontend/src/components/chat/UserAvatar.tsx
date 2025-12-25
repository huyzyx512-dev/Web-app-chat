import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

interface IUserAvatarProps {
  type: "sidebar" | "chat" | "profile";
  name: string;
  avatarUrl?: string;
  className?: string;
}

const UserAvatar = ({ type, name, avatarUrl, className }: IUserAvatarProps) => {
  const bgColor = !avatarUrl ? "bg-blue-50" : "";
  if (!name) {
    name = "Moji";
  }

  return (
    <Avatar
      className={cn(
        className ?? "",
        type === "sidebar" && "size-12 text-base",
        type === "chat" && "size-8 text-sm",
        type === "profile" && "size-24 text-3xl shadow-md"
      )}
    >
      {/* <AvatarImage src={avatarUrl} alt={name} /> */}
      <AvatarImage src="https://tse4.mm.bing.net/th/id/OIP.kj3lOSQmwmp3DJevlY9emQHaHa?cb=ucfimg2&pid=ImgDet&ucfimg=1&w=187&h=187&c=7&dpr=1.3&o=7&rm=3" alt={name} className="size-10" />
      <AvatarFallback className={`${bgColor} text-white font-semibold`}>
        {name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
