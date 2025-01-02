import { useEffect, useState } from 'react'
import { useAuth } from '../components/auth/hooks/useAuth'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

export function useProfile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user?.id) return

    async function loadProfile() {
      try {
        setLoading(true)

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error

        setProfile(data)
      } catch (e) {
        setError(e instanceof Error ? e : new Error('An error occurred'))
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user?.id])

  async function updateProfile(updates: Partial<Profile>) {
    if (!user?.id) return

    try {
      setLoading(true)

      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)

      if (error) throw error

      setProfile(prev => (prev ? { ...prev, ...updates } : null))
    } catch (e) {
      setError(e instanceof Error ? e : new Error('An error occurred'))
      throw e
    } finally {
      setLoading(false)
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile,
  }
}
