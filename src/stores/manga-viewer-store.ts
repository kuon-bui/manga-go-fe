import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewerMode = 'vertical' | 'single' | 'double'
export type ReaderUiMode = 'classic' | 'kawaii'

interface MangaViewerState {
  mode: ViewerMode
  uiMode: ReaderUiMode
  currentPage: number      // 0-indexed
  settingsOpen: boolean
  controlsVisible: boolean // True when Top/Bottom bars are visible

  setMode: (_mode: ViewerMode) => void
  setUiMode: (_ui: ReaderUiMode) => void
  setCurrentPage: (_page: number) => void
  nextPage: (_total: number) => void
  prevPage: () => void
  toggleSettings: () => void
  toggleControls: () => void
  reset: () => void
}

export const useMangaViewerStore = create<MangaViewerState>()(
  persist(
    (set, get) => ({
      mode: 'vertical',
      uiMode: 'classic',
      currentPage: 0,
      settingsOpen: false,
      controlsVisible: true,

      setMode: (mode) => set({ mode, currentPage: 0 }),
      setUiMode: (uiMode) => {
        const { mode } = get()
        // Kawaii layout is page-by-page; switch out of vertical if needed
        if (uiMode === 'kawaii' && mode === 'vertical') {
          set({ uiMode, mode: 'single', currentPage: 0 })
        } else {
          set({ uiMode })
        }
      },
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
      toggleControls: () => set((s) => ({ controlsVisible: !s.controlsVisible })),
      reset: () => set({ currentPage: 0, settingsOpen: false, controlsVisible: true }),
    }),
    {
      name: 'manga-go-viewer',
      partialize: (s) => ({ mode: s.mode, uiMode: s.uiMode }),
    }
  )
)
