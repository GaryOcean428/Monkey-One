/* eslint-disable no-undef */
import React from 'react'
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
  return 'share' in nav
}

export function ShareModal({ title, url, onShare, children }: ShareModalProps) {
  const isClient = typeof window !== 'undefined'
  const canShare = isClient && isNavigatorShareSupported(navigator)

  const handleCopy = async () => {
    const operationId = `copy-${Date.now()}`
    monitoring.startOperation(operationId)

    try {
      if (isClient) {
        await navigator.clipboard.writeText(url)
        toast({
          title: 'Copied!',
          description: 'Link copied to clipboard',
        })
        onShare?.(url)
        monitoring.endOperation(operationId, 'share_copy_success')
      }
    } catch (error) {
      monitoring.recordError(
        'share_copy',
        error instanceof Error ? error.message : 'Failed to copy link'
      )
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
      })
    }
  }

  const handleShare = async () => {
    const operationId = `share-${Date.now()}`
    monitoring.startOperation(operationId)

    try {
      if (canShare) {
        await navigator.share({
          title,
          url,
        })
        onShare?.(url)
        monitoring.endOperation(operationId, 'share_native_success')
      } else {
        handleCopy()
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        monitoring.recordError('share_native', error.message)
        toast({
          title: 'Error',
          description: 'Failed to share',
          variant: 'destructive',
        })
      }
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <div className="flex flex-col space-y-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>Share this link with others</DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input
              value={url}
              readOnly
              className="flex-1"
              onClick={e => e.currentTarget.select()}
            />
            <Button onClick={handleCopy}>Copy</Button>
            {canShare && <Button onClick={handleShare}>Share</Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
