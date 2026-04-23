import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'sakura-light' | 'sakura-dark' | 'system';

export interface ThemeOption {
  value: Theme;
  label: string;
  isDark: boolean;
  previewBg: string;
  previewAccent: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    value: 'sakura-light',
    label: 'Sakura Light',
    isDark: false,
    previewBg: '#FFF5F8',
    previewAccent: '#F48FB1',
  },
  {
    value: 'sakura-dark',
    label: 'Sakura Dark',
    isDark: true,
    previewBg: '#1F141D',
    previewAccent: '#F48FB1',
  },
  {
    value: 'system',
    label: 'System',
    isDark: false,
    previewBg: 'linear-gradient(135deg,#FFF5F8 50%,#1F141D 50%)',
    previewAccent: '#F48FB1',
  },
];

// sakura-light → no extra class (uses :root defaults)
// sakura-dark  → 'dark' class (uses .dark overrides)
export const THEME_CLASS: Record<Exclude<Theme, 'system'>, string> = {
  'sakura-light': '',
  'sakura-dark': 'dark',
};

interface ThemeState {
  theme: Theme;
  setTheme: (_theme: Theme) => void;
  resolvedTheme: () => 'light' | 'dark';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      resolvedTheme: () => {
        const { theme } = get();
        const option = THEME_OPTIONS.find((o) => o.value === theme);
        if (!option) return 'light';
        if (theme === 'system') {
          return typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
        }
        return option.isDark ? 'dark' : 'light';
      },
    }),
    { name: 'manga-go-theme' }
  )
);
