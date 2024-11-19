import { create } from 'zustand';

interface NavigationState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeTab: 'chat',
  setActiveTab: (tab) => set({ activeTab: tab })
}));