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
  /** Backend role names, e.g. ['admin', 'translator']. Stored after login. */
  roles: string[];
  isAuthenticated: boolean;
  setAuth: (_user: User, _roles?: string[]) => void;
  setRoles: (_roles: string[]) => void;
  logout: () => void;
  updateUser: (_user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      roles: [],
      isAuthenticated: false,

      setAuth: (user, roles = []) => {
        setFlagCookie();
        set({ user, roles, isAuthenticated: true });
      },

      setRoles: (roles) => {
        set({ roles });
      },

      logout: () => {
        clearFlagCookie();
        set({ user: null, roles: [], isAuthenticated: false });
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
        roles: state.roles,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

