import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/auth';

// Thin JS-readable flag cookie for Next.js middleware edge reads.
// Real authentication is the server-set HTTP-only access_token cookie.
function setFlagCookie() {
  document.cookie = `manga-go-token=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function clearFlagCookie() {
  document.cookie = 'manga-go-token=; path=/; max-age=0; SameSite=Lax';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (_user: User) => void;
  logout: () => void;
  updateUser: (_user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setAuth: (user) => {
        setFlagCookie();
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        clearFlagCookie();
        set({ user: null, isAuthenticated: false });
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
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
