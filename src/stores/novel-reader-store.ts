import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NovelReaderTheme = 'day' | 'night' | 'sepia'
export type FontFamily = 'serif' | 'sans' | 'mono'

interface NovelReaderState {
  theme: NovelReaderTheme
  fontFamily: FontFamily
  fontSize: number       // px, range 14–24
  lineHeight: number     // unitless, range 1.4–2.2
  textWidth: number      // ch, range 50–90
  settingsOpen: boolean

  setTheme: (theme: NovelReaderTheme) => void
  setFontFamily: (family: FontFamily) => void
  setFontSize: (size: number) => void
  setLineHeight: (lh: number) => void
  setTextWidth: (width: number) => void
  toggleSettings: () => void
}

export const useNovelReaderStore = create<NovelReaderState>()(
  persist(
    (set) => ({
      theme: 'day',
      fontFamily: 'serif',
      fontSize: 18,
      lineHeight: 1.8,
      textWidth: 70,
      settingsOpen: false,

      setTheme: (theme) => set({ theme }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setFontSize: (fontSize) => set({ fontSize }),
      setLineHeight: (lineHeight) => set({ lineHeight }),
      setTextWidth: (textWidth) => set({ textWidth }),
      toggleSettings: () => set((s) => ({ settingsOpen: !s.settingsOpen })),
    }),
    {
      name: 'manga-go-novel-reader',
      partialize: (s) => ({
        theme: s.theme,
        fontFamily: s.fontFamily,
        fontSize: s.fontSize,
        lineHeight: s.lineHeight,
        textWidth: s.textWidth,
      }),
    }
  )
)
