import React, { useEffect, useRef } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDialogElement>(null)

  // Handle modal open/close
  useEffect(() => {
    const modal = modalRef.current
    if (!modal) return

    if (isOpen) {
      modal.showModal()
    } else {
      modal.close()
    }
  }, [isOpen])

  // Handle click outside to close
  useEffect(() => {
    const modal = modalRef.current
    if (!modal) return

    const handleClickOutside = (event: MouseEvent) => {
      if (event.target === modal) {
        onClose()
      }
    }

    modal.addEventListener('click', handleClickOutside)
    return () => modal.removeEventListener('click', handleClickOutside)
  }, [onClose])

  // Handle escape key to close
  useEffect(() => {
    const modal = modalRef.current
    if (!modal) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    modal.addEventListener('keydown', handleEscape)
    return () => modal.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!isOpen) return null

  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-content">
        {children}
        <button onClick={onClose} className="close-button">
          Close
        </button>
      </div>
    </dialog>
  )
}
