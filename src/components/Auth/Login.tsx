import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useAuth } from '../../hooks/useAuth'
import { toast } from 'react-hot-toast'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const { signIn, error: authError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn(email, password)
      if (result.error) {
        toast.error(result.error.message)
      } else {
        toast.success('Successfully logged in!')
        navigate('/dashboard')
      }
    } catch (err) {
      toast.error('Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
              placeholder="Enter your email"
              aria-label="Email"
              disabled={isLoading}
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
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
              placeholder="Enter your password"
              aria-label="Password"
              disabled={isLoading}
            />
          </div>
          {authError && (
            <div className="text-red-600 text-sm">{authError.message}</div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
