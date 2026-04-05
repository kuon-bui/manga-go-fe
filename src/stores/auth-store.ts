import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/auth';

// Sync a simple cookie for middleware edge reads (localStorage is unavailable there)
function setAuthCookie(token: string) {
  document.cookie = `manga-go-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function clearAuthCookie() {
  document.cookie = 'manga-go-token=; path=/; max-age=0; SameSite=Lax';
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (_user: User, _accessToken: string) => void;
  logout: () => void;
  updateUser: (_user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken) => {
        setAuthCookie(accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },
      logout: () => {
        clearAuthCookie();
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
      updateUser: (partial) => {
        const current = get().user;
        if (current) set({ user: { ...current, ...partial } });
      },
    }),
    {
      name: 'manga-go-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
