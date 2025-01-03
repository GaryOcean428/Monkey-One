import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NavigationState {
  activeTab: string
  setActiveTab: (tab: string) => void
  isCollapsed: boolean
  toggleSidebar: () => void
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    set => ({
      activeTab: 'dashboard',
      setActiveTab: tab => set({ activeTab: tab }),
      isCollapsed: false,
      toggleSidebar: () => set(state => ({ isCollapsed: !state.isCollapsed })),
    }),
    {
      name: 'navigation-store',
      partialize: state => ({ isCollapsed: state.isCollapsed }), // Only persist sidebar collapsed state
    }
  )
)
