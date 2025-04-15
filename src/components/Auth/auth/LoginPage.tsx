import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { useAuth } from './hooks/useAuth'
import { useToast } from '../ui/use-toast'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const { signIn, signUp, resetPassword, signInWithGoogle, error: authError } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
      navigate('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: 'Error',
        description: 'Failed to sign in. Please check your credentials.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    try {
      await resetPassword(email)
      toast({
        title: 'Success',
        description: 'Password reset email sent. Please check your inbox.',
        variant: 'success',
      })
    } catch (error) {
      console.error('Reset password error:', error)
      toast({
        title: 'Error',
        description: 'Failed to send password reset email. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleSignInWithGoogle = async () => {
    try {
      await signInWithGoogle()
      navigate('/dashboard')
    } catch (error) {
      console.error('Google sign-in error:', error)
      toast({
        title: 'Error',
        description: 'Failed to sign in with Google. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Welcome to Monkey One</h1>
          <p className="mt-2 text-muted-foreground">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {authError && (
            <div className="text-sm text-red-600" role="alert">
              {authError.message}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={handleResetPassword}
            disabled={isLoading}
          >
            Forgot password?
          </button>
        </div>

        <div className="mt-6 text-center text-sm">
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={isLoading}
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

        <div className="mt-6 text-center text-sm">
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={handleSignInWithGoogle}
            disabled={isLoading}
          >
            Sign in with Google
          </button>
        </div>
      </Card>
    </div>
  )
}
