import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function AuthCallback() {
  const navigate = useNavigate()
  const { handleAuthCallback } = useAuth()

  React.useEffect(() => {
    const handleCallback = async () => {
      try {
        await handleAuthCallback()
        navigate('/')
      } catch (error) {
        console.error('Auth callback error:', error)
        navigate('/auth/error')
      }
    }

    handleCallback()
  }, [handleAuthCallback, navigate])

  return (
    <div className="auth-callback">
      <h2>Processing authentication...</h2>
      <div className="loading-spinner" />
    </div>
  )
}
