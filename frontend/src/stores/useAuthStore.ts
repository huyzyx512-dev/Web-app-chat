import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null, // token để xác thực người dùng
  user: null, // người dùng
  loading: false, // trạng thái khi gọi api

  clearState: () => {
    set({ accessToken: null, user: null, loading: false });
  },

  signUp: async (username, password, email, firstName, lastName) => {
    try {
      set({ loading: true });

      // call api
      await authService.signUp(username, password, email, firstName, lastName);

      toast.success("Đăng ký thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Đăng ký không thành công!");
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (username, password) => {
    try {
      set({ loading: true });

      // call api
      const { accessToken } = await authService.signIn(username, password);

      set({ accessToken: accessToken });

      await get().fetchMe();

      toast.success("Đăng nhập thành công");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Đăng nhập không thành công!");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      // call api
      await authService.signOut();

      get().clearState();

      toast.success("Đăng xuất thành công.");
    } catch (error) {
      console.log(error);
      toast.error("Hãy thử lại!");
    } finally {
      set({ loading: false });
    }
  },

  fetchMe: async () => {
    try {
      set({ loading: true });
      const user = await authService.fetchMe();

      set({ user: user });
    } catch (error) {
      console.log(error);
      toast.error("Lỗi xảy ra khi lấy dữ liệu người dùng. Hãy thử lại!");
    } finally {
      set({ loading: false });
    }
  },

  refresh: async () => {
    try {
      set({ loading: true });
      const { user, fetchMe } = get();
      const accessToken = await authService.refresh();

      set({ accessToken });

      if (!user) {
        await fetchMe();
      }
    } catch (error) {
      console.log(error);
      toast.warning("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
      get().clearState();
    } finally {
      set({ loading: false });
    }
  },
}));
