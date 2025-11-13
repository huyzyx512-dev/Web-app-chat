import Logout from "@/components/auth/Logout";
import { useAuthStore } from "@/stores/useAuthStore";

const ChatAppPage = () => {
  const user = useAuthStore((s) => s.user);
  console.log(user?.userName);
  return (
    <div>
      {user?.userName}
      <Logout />
    </div>
  );
};

export default ChatAppPage;
