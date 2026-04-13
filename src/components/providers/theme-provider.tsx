'use client';

import { useEffect } from 'react';
import { useThemeStore, THEME_CLASS, type Theme } from '@/stores/theme-store';

function applyThemeClasses(theme: Theme) {
  const root = document.documentElement;
  // Remove all known theme classes
  root.classList.remove('dark', 'light', 'midnight', 'sepia-theme', 'slate-theme', 'forest-theme');

  if (theme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) root.classList.add('dark');
    return;
  }

  const classes = THEME_CLASS[theme];
  if (classes) {
    classes.split(' ').filter(Boolean).forEach((c) => root.classList.add(c));
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    applyThemeClasses(theme);

    if (theme === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyThemeClasses('system');
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    }
  }, [theme]);

  return <>{children}</>;
}
