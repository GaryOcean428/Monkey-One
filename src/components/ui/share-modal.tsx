/* eslint-disable no-undef */
import React, { useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from './dialog'
import { Button } from './button'
import { Input } from './input'
import { toast } from './use-toast'
import { monitoring } from '../../lib/monitoring/MonitoringSystem'

interface ShareModalProps {
  title: string
  url: string
  onShare?: (url: string) => void
  children: React.ReactNode
}

interface NavigatorShare {
  share(data: { title: string; url: string }): Promise<void>
}

function isNavigatorShareSupported(nav: Navigator): nav is Navigator & NavigatorShare {
  return typeof nav !== 'undefined' && 'share' in nav
}

export function ShareModal({ title, url, onShare, children }: ShareModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.select()
    }
  }, [isOpen])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: 'Copied!',
        description: 'Link copied to clipboard',
      })
      onShare?.(url)
      monitoring.logEvent('share_copy_success')
    } catch (error) {
      console.error('Failed to copy:', error)
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      })
      monitoring.logEvent('share_copy_error')
    }
  }

  const handleShare = async () => {
    if (!isNavigatorShareSupported(navigator)) {
      await handleCopy()
      return
    }

    try {
      await navigator.share({
        title,
        url,
      })
      onShare?.(url)
      monitoring.logEvent('share_native_success')
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Failed to share:', error)
        toast({
          title: 'Failed to share',
          description: 'Please try again',
          variant: 'destructive',
        })
        monitoring.logEvent('share_native_error')
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Share this link with others or copy it for your records.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Input ref={inputRef} readOnly value={url} className="flex-1" />
          <Button onClick={handleCopy}>Copy</Button>
          {isNavigatorShareSupported(navigator) && <Button onClick={handleShare}>Share</Button>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
