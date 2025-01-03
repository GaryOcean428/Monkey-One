import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase/client'

export function useFeatureFlag(
  flagKey: string,
  defaultValue: boolean = false
): [boolean, boolean, Error | null] {
  const [isEnabled, setIsEnabled] = useState<boolean>(defaultValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchFeatureFlag() {
      try {
        const { data, error } = await supabase
          .from('feature_flags')
          .select('enabled')
          .eq('key', flagKey)
          .single()

        if (error) throw error

        if (isMounted) {
          setIsEnabled(data?.enabled ?? defaultValue)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          console.error(`Error fetching feature flag ${flagKey}:`, err)
          setError(err instanceof Error ? err : new Error('Unknown error'))
          setIsEnabled(defaultValue)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Set up real-time subscription for feature flag updates
    const subscription = supabase
      .channel(`feature_flag_${flagKey}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_flags',
          filter: `key=eq.${flagKey}`,
        },
        payload => {
          if (isMounted) {
            const newValue = payload.new as { enabled: boolean } | null
            setIsEnabled(newValue?.enabled ?? defaultValue)
          }
        }
      )
      .subscribe()

    fetchFeatureFlag()

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [flagKey, defaultValue])

  return [isEnabled, loading, error]
}
