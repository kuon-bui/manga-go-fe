'use client';

import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useThemeStore, THEME_OPTIONS } from '@/stores/theme-store';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change theme">
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {THEME_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={cn(
              'flex items-center gap-2.5 cursor-pointer',
              theme === opt.value && 'font-semibold'
            )}
          >
            {/* Color swatch */}
            <span
              className="h-4 w-4 shrink-0 rounded-full border border-border shadow-sm"
              style={{ background: opt.previewBg }}
              aria-hidden
            />
            <span className="flex-1">{opt.label}</span>
            {theme === opt.value && (
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
