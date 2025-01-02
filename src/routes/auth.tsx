import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/ui/use-toast'

export function AuthCallback() {
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {

        if (session) {
          toast({
            title: 'Authentication Successful',
            description: 'You have been successfully authenticated',
          })
          navigate('/dashboard')
        } else {
          navigate('/login')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        toast({
          title: 'Authentication Error',
          description: error instanceof Error ? error.message : 'Authentication failed',
          variant: 'destructive',
        })
        navigate('/login')
      }
    }

    handleAuthCallback()
  }, [navigate, toast])

  return <div>Processing authentication...</div>
}

export function PasswordReset() {
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        const error = await supabase.auth.resetPasswordForEmail(location.state?.email)
        if (error) {

        toast({
          title: 'Password Reset Email Sent',
          description: 'Check your email for the password reset link',
        })
        navigate('/login')
      } catch (error) {
        console.error('Password reset error:', error)
        toast({
          title: 'Password Reset Error',
          description: error instanceof Error ? error.message : 'Failed to send reset email',
          variant: 'destructive',
        })
        navigate('/login')
      }
    }

    if (location.state?.email) {
      handlePasswordReset()
    } else {
      navigate('/login')
    }
  }, [location.state?.email, navigate, toast])

  return <div>Processing password reset...</div>
}

export { AuthCallback, PasswordReset }
