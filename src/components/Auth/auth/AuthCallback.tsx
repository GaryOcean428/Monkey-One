import React, { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from './hooks/useAuth'
import { Button } from '../ui/button'

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate()
  const { handleAuthCallback } = useAuth()

  useEffect(() => {
    async function processCallback() {
      try {
        await handleAuthCallback()
        navigate('/')
      } catch (error) {
        console.error('Auth callback error:', error)
        navigate('/login', {
          state: {
            error: 'Authentication failed. Please try again.',
          },
        })
      }
    }

    processCallback()
  }, [handleAuthCallback, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">Processing authentication...</p>
        <div className="mt-4 space-x-2">
          <Button onClick={() => processCallback()}>Retry Authentication</Button>
          <Button onClick={() => navigate('/login')}>Go Back to Login</Button>
          <Button onClick={() => navigate('/support')}>Contact Support</Button>
        </div>
      </div>
    </div>
  )
}
