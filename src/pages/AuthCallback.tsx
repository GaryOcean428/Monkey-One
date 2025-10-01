/**
 * Authentication Callback Page
 *
 * Handles OAuth callback from Google and other providers
 */

import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export function AuthCallback(): JSX.Element {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, isLoading } = useAuth()
  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = React.useState('Processing authentication...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error parameters
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        if (error) {
          setStatus('error')
          setMessage(errorDescription || `Authentication error: ${error}`)
          return
        }

        // Check for authorization code
        const code = searchParams.get('code')
        const state = searchParams.get('state')

        if (code) {
          setMessage('Exchanging authorization code...')
          // The actual token exchange is handled by the Google Auth library
          // We just need to wait for the auth context to update
          
          // Wait a bit for the auth context to process
          setTimeout(() => {
            if (isAuthenticated) {
              setStatus('success')
              setMessage('Authentication successful! Redirecting...')
              setTimeout(() => navigate('/dashboard'), 1500)
            } else {
              setStatus('error')
              setMessage('Authentication failed. Please try again.')
            }
          }, 2000)
        } else {
          setStatus('error')
          setMessage('No authorization code received')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage('An unexpected error occurred during authentication')
      }
    }

    handleCallback()
  }, [searchParams, isAuthenticated, navigate])

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && status !== 'loading') {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate, status])

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />
    }
  }

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Authenticating...'
      case 'success':
        return 'Authentication Successful'
      case 'error':
        return 'Authentication Failed'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle>{getTitle()}</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we complete your sign-in...'}
            {status === 'success' && 'You will be redirected to the dashboard shortly.'}
            {status === 'error' && 'There was a problem signing you in.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {message}
          </p>
          
          {status === 'error' && (
            <div className="space-y-2">
              <button
                onClick={() => navigate('/')}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
              >
                Continue to Dashboard
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}