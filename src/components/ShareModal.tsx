import React, { useEffect, useRef, useState } from 'react'
import { ErrorHandler } from '../utils/errorHandler'

interface ShareModalProps {
  url?: string
  title?: string
  onClose: () => void
}

export const ShareModal: React.FC<ShareModalProps> = ({
  url = window.location.href,
  title = document.title,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      try {
        if (
          modalRef.current &&
          event.target instanceof Node &&
          !modalRef.current.contains(event.target)
        ) {
          onClose()
        }
      } catch (error) {
        ErrorHandler.log('Error in share modal outside click handler', {
          level: 'warn',
          context: { error },
        })
      }
    }

    // Safely add event listener
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      // Safely remove event listener
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  const handleCopyLink = async () => {
    try {
      // Safely access clipboard using window.navigator
      await window.navigator?.clipboard?.writeText(url)
      setCopyStatus('copied')

      // Reset status after 2 seconds
      setTimeout(() => setCopyStatus('idle'), 2000)
    } catch (err) {
      ErrorHandler.log('Failed to copy link', {
        level: 'warn',
        context: { error: err },
      })
      setCopyStatus('error')
    }
  }

  const shareOnSocialMedia = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    try {
      const encodedUrl = encodeURIComponent(url)
      const encodedTitle = encodeURIComponent(title)

      const socialShareUrls = {
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      }

      window.open(socialShareUrls[platform], '_blank', 'width=600,height=300')
    } catch (error) {
      ErrorHandler.log('Error sharing on social media', {
        level: 'warn',
        context: { platform, error },
      })
    }
  }

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold">Share this page</h2>

        <div className="mb-4 flex items-center">
          <input
            type="text"
            readOnly
            value={url}
            aria-label="Shareable URL"
            placeholder="Shareable URL"
            className="flex-grow rounded-l-md border bg-gray-100 p-2"
          />
          <button
            onClick={handleCopyLink}
            aria-label="Copy link"
            className={`rounded-r-md px-4 py-2 ${
              copyStatus === 'copied'
                ? 'bg-green-500 text-white'
                : copyStatus === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-blue-500 text-white'
            } `}
          >
            {copyStatus === 'copied' ? 'Copied!' : copyStatus === 'error' ? 'Copy Failed' : 'Copy'}
          </button>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => shareOnSocialMedia('twitter')}
            aria-label="Share on Twitter"
            className="rounded bg-blue-400 p-2 text-white hover:bg-blue-500"
          >
            Twitter
          </button>
          <button
            onClick={() => shareOnSocialMedia('facebook')}
            aria-label="Share on Facebook"
            className="rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
          >
            Facebook
          </button>
          <button
            onClick={() => shareOnSocialMedia('linkedin')}
            aria-label="Share on LinkedIn"
            className="rounded bg-blue-800 p-2 text-white hover:bg-blue-900"
          >
            LinkedIn
          </button>
        </div>

        <button
          onClick={onClose}
          aria-label="Close share modal"
          className="mt-4 w-full rounded bg-gray-200 p-2 text-gray-800 hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  )
}
