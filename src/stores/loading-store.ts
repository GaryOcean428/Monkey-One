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
      setLoading: (isLoading, text = null) => set({ isLoading, loadingText: text }),
      startLoading: (text = null) => set({ isLoading: true, loadingText: text }),
      stopLoading: () => set({ isLoading: false, loadingText: null }),
    }),
    { name: 'loading-store' }
  )
)
