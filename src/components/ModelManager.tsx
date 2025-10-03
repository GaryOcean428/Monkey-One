import React, { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { logger } from '../utils/logger'
import { ProviderRegistry } from '../lib/providers/ProviderRegistry'
import { LocalProvider } from '../lib/providers/LocalProvider'

interface ModelManagerProps {
  onInitialize?: () => void
}

export function ModelManager({ onInitialize }: ModelManagerProps) {
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const providerRegistry = ProviderRegistry.getInstance()

  useEffect(() => {
    const handleInitialize = async () => {
      setIsInitializing(true)
      setError(null)

      try {
        // Check if provider is already registered
        if (!providerRegistry.hasProvider('local')) {
          const localProvider = new LocalProvider()
          await providerRegistry.registerProvider('local', localProvider)
          logger.info('Local provider initialized successfully')
          onInitialize?.()
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        logger.error('Failed to initialize local provider:', err)
        setError(errorMessage)
      } finally {
        setIsInitializing(false)
      }
    }

    handleInitialize()
  }, [onInitialize])

  if (error) {
    return (
      <Card className="bg-destructive/10 p-4">
        <h3 className="mb-2 text-lg font-semibold">Service Initialization Error</h3>
        <p className="text-destructive mb-4 text-sm">{error}</p>
        <Button variant="outline" onClick={() => handleInitialize()} disabled={isInitializing}>
          {isInitializing ? 'Initializing...' : 'Retry'}
        </Button>
      </Card>
    )
  }

  return null
}
