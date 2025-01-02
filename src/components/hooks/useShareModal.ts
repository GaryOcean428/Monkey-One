import { useState } from 'react'

export function useShareModal() {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState(window.location.href)
  const [shareTitle, setShareTitle] = useState(document.title)

  const openShareModal = (url?: string, title?: string) => {
    setShareUrl(url || window.location.href)
    setShareTitle(title || document.title)
    setIsShareModalOpen(true)
  }

  const closeShareModal = () => {
    setIsShareModalOpen(false)
  }

  return {
    isShareModalOpen,
    shareUrl,
    shareTitle,
    openShareModal,
    closeShareModal,
  }
}
