import React, { createContext, useContext, useState, ReactNode } from 'react'

interface ModalContextType {
  isOpen: boolean
  modalContent: ReactNode
  openModal: (content: ReactNode) => void
  closeModal: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [modalContent, setModalContent] = useState<ReactNode>(null)

  const openModal = (content: ReactNode) => {
    setModalContent(content)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setModalContent(null)
  }

  return (
    <ModalContext.Provider value={{ isOpen, modalContent, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}
