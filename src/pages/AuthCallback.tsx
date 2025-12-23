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

  // Primary effect: Handle authentication and redirect
  useEffect(() => {
    // Check for OAuth errors first
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (error) {
      setStatus('error')
      setMessage(errorDescription || `Authentication error: ${error}`)
      return
    }

    // If authentication is complete, redirect immediately
    if (!isLoading && isAuthenticated) {
      setStatus('success')
      setMessage('Authentication successful! Redirecting...')
      // Small delay for user feedback, then redirect
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 800)
      return () => clearTimeout(timer)
    }

    // If loading is complete but not authenticated
    if (!isLoading && !isAuthenticated) {
      const code = searchParams.get('code')
      if (!code) {
        setStatus('error')
        setMessage('No authorization code received. Please try signing in again.')
      } else {
        setStatus('error')
        setMessage('Authentication failed. Please try again.')
      }
    }
  }, [isAuthenticated, isLoading, navigate, searchParams])

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
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">{getIcon()}</div>
          <CardTitle>{getTitle()}</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we complete your sign-in...'}
            {status === 'success' && 'You will be redirected to the dashboard shortly.'}
            {status === 'error' && 'There was a problem signing you in.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4 text-sm">{message}</p>

          {status === 'error' && (
            <div className="space-y-2">
              <button
                onClick={() => navigate('/')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-4 py-2 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full rounded-md px-4 py-2 transition-colors"
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
