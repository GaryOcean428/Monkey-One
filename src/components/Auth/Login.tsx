import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../ui/card'
import { Input } from '../ui/Input'
import { Button } from '../ui/button'
import { useAuth } from '../../hooks/useAuth'
import { toast } from 'react-hot-toast'
import { AuthError } from '@supabase/supabase-js'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const { signIn, error: authError, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAuthError = (error: AuthError) => {
    switch (error.message) {
      case 'Invalid login credentials':
        toast.error('Invalid email or password')
        break
      case 'Email not confirmed':
        toast.error('Please confirm your email address')
        break
      case 'Invalid email':
        toast.error('Please enter a valid email address')
        break
      default:
        toast.error(error.message || 'Failed to sign in')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent duplicate submissions
    if (isSubmitting || authLoading) return

    setIsSubmitting(true)

    try {
      const result = await signIn(email, password)
      if (result.error) {
        handleAuthError(result.error)
      } else {
        toast.success('Successfully logged in!')
        navigate('/dashboard')
      }
    } catch (err) {
      console.error('Sign in error:', err)
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = isSubmitting || authLoading

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <h1 className="mb-6 text-center text-2xl font-bold">Sign In</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mt-1"
              placeholder="Enter your email"
              aria-label="Email"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="mt-1"
              placeholder="Enter your password"
              aria-label="Password"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>
          {authError && (
            <div className="text-sm text-red-600" role="alert">
              {authError.message}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading} aria-busy={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
