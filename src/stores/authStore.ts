import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface AuthModalState {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

export const useAuthModalStore = create<AuthModalState>()(
  devtools(
    (set) => ({
      isOpen: true,
      openModal: () => set({ isOpen: true }),
      closeModal: () => set({ isOpen: false }),
    }),
    { name: 'auth-modal-store' }
  )
)
