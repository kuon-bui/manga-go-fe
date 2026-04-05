import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewerMode = 'vertical' | 'single' | 'double'

interface MangaViewerState {
  mode: ViewerMode
  currentPage: number      // 0-indexed
  settingsOpen: boolean

  setMode: (mode: ViewerMode) => void
  setCurrentPage: (page: number) => void
  nextPage: (total: number) => void
  prevPage: () => void
  toggleSettings: () => void
  reset: () => void
}

export const useMangaViewerStore = create<MangaViewerState>()(
  persist(
    (set, get) => ({
      mode: 'vertical',
      currentPage: 0,
      settingsOpen: false,

      setMode: (mode) => set({ mode, currentPage: 0 }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      nextPage: (total) => {
        const { currentPage, mode } = get()
        const step = mode === 'double' ? 2 : 1
        const next = Math.min(currentPage + step, total - 1)
        set({ currentPage: next })
      },
      prevPage: () => {
        const { currentPage, mode } = get()
        const step = mode === 'double' ? 2 : 1
        set({ currentPage: Math.max(currentPage - step, 0) })
      },
      toggleSettings: () => set((s) => ({ settingsOpen: !s.settingsOpen })),
      reset: () => set({ currentPage: 0, settingsOpen: false }),
    }),
    {
      name: 'manga-go-viewer',
      partialize: (s) => ({ mode: s.mode }),
    }
  )
)
