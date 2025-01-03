import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../ui/card'
import { LabeledInput } from '../ui/LabeledInput'
import { Button } from '../ui/button'
import { useAuth } from './hooks/useAuth'

export const Register: React.FC = () => {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await signUp(email, password)
      if (error) throw error
      navigate('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <h2 className="mb-6 text-center text-2xl font-bold">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <LabeledInput
              type="email"
              label="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={isLoading}
              error={error || undefined}
            />
          </div>
          <div>
            <LabeledInput
              type="password"
              label="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <LabeledInput
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Create Account
          </Button>
          <div className="text-center">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/login')}
              disabled={isLoading}
            >
              Back to Sign In
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
