import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface PanelState {
  loading: Record<string, boolean>
  error: Record<string, string | null>
  setLoading: (panelId: string, isLoading: boolean) => void
  setError: (panelId: string, error: string | null) => void
  clearError: (panelId: string) => void
  clearPanel: (panelId: string) => void
}

export const usePanelStore = create<PanelState>()(
  devtools(
    (set) => ({
      loading: {},
      error: {},
      setLoading: (panelId, isLoading) =>
        set((state) => ({
          loading: { ...state.loading, [panelId]: isLoading },
        })),
      setError: (panelId, error) =>
        set((state) => ({
          error: { ...state.error, [panelId]: error },
        })),
      clearError: (panelId) =>
        set((state) => ({
          error: { ...state.error, [panelId]: null },
        })),
      clearPanel: (panelId) =>
        set((state) => {
          const { [panelId]: _, ...loading } = state.loading
          const { [panelId]: __, ...error } = state.error
          return { loading, error }
        }),
    }),
    { name: 'panel-store' }
  )
)
