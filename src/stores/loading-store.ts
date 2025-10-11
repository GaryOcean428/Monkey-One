import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface LoadingState {
  isLoading: boolean
  loadingText: string | null
  setLoading: (isLoading: boolean, text?: string | null) => void
  startLoading: (text?: string) => void
  stopLoading: () => void
}

export const useLoadingStore = create<LoadingState>()(
  devtools(
    set => ({
      isLoading: false,
      loadingText: null,
      setLoading: (isLoading, text) =>
        set({ isLoading, loadingText: text ?? null }),
      startLoading: text =>
        set({ isLoading: true, loadingText: text ?? null }),
      stopLoading: () => set({ isLoading: false, loadingText: null }),
    }),
    { name: 'loading-store' }
  )
)
