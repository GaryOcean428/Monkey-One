import { useEffect, useCallback } from 'react'

type KeyCombo = string
type Handler = (event: KeyboardEvent) => void

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

export function useHotkeys(keyCombo: KeyCombo, callback: () => void, deps: any[] = []) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const mod = isMac ? event.metaKey : event.ctrlKey

      const keys = keyCombo.toLowerCase().split('+')
      const mainKey = keys[keys.length - 1]

      if (keyCombo.includes('mod') && !mod) return
      if (mainKey !== event.key.toLowerCase()) return

      event.preventDefault()
      callback()
    },
    [keyCombo, callback]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown, ...deps])
}
