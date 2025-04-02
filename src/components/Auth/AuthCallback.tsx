import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error during auth callback:', error)
          navigate('/login', {
            state: {
              error: 'Authentication failed. Please try again.'
            }
          })
          return
        }

        // Successful authentication
        navigate('/dashboard')
      } catch (err) {
        console.error('Unexpected error during auth callback:', err)
        navigate('/login', {
          state: {
            error: 'An unexpected error occurred. Please try again.'
          }
        })
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Completing sign in...</h2>
        <p className="text-muted-foreground">You will be redirected shortly.</p>
      </div>
    </div>
  )
}
