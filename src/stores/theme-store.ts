import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'midnight' | 'sepia' | 'slate' | 'forest' | 'system';

export interface ThemeOption {
  value: Theme;
  label: string;
  isDark: boolean;
  previewBg: string;
  previewAccent: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { value: 'light',   label: 'Light',    isDark: false, previewBg: '#ffffff', previewAccent: '#2563eb' },
  { value: 'dark',    label: 'Dark',     isDark: true,  previewBg: '#0f172a', previewAccent: '#3b82f6' },
  { value: 'midnight',label: 'Midnight', isDark: true,  previewBg: '#1b1c26', previewAccent: '#ff6740' },
  { value: 'sepia',   label: 'Sepia',    isDark: false, previewBg: '#ede3d9', previewAccent: '#8b5e3c' },
  { value: 'slate',   label: 'Slate',    isDark: true,  previewBg: '#181d2e', previewAccent: '#60a5fa' },
  { value: 'forest',  label: 'Forest',   isDark: true,  previewBg: '#111a14', previewAccent: '#22c55e' },
  { value: 'system',  label: 'System',   isDark: false, previewBg: 'linear-gradient(135deg,#fff 50%,#0f172a 50%)', previewAccent: '#2563eb' },
];

// CSS class to apply for each theme
export const THEME_CLASS: Record<Exclude<Theme, 'system'>, string> = {
  light:   '',
  dark:    'dark',
  midnight:'midnight dark',
  sepia:   'sepia-theme',
  slate:   'slate-theme dark',
  forest:  'forest-theme dark',
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
          return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
        }
        return option.isDark ? 'dark' : 'light';
      },
    }),
    { name: 'manga-go-theme' }
  )
);
