import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

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
        navigate('/login')
      }
    }

    processCallback()
  }, [handleAuthCallback, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing authentication...</p>
      </div>
    </div>
  )
}
