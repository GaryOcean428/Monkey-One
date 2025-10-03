import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { useAuth } from './hooks/useAuth'

export const PasswordReset: React.FC = () => {
  const navigate = useNavigate()
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await resetPassword(email)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md p-8">
          <h2 className="mb-6 text-center text-2xl font-bold">Check Your Email</h2>
          <p className="mb-6 text-center text-gray-600">
            If an account exists for {email}, you will receive password reset instructions.
          </p>
          <div className="space-y-4">
            <Button onClick={() => navigate('/login')} className="w-full">
              Return to Login
            </Button>
            <Button onClick={() => navigate('/support')} className="w-full">
              Contact Support
            </Button>
            <Button onClick={handleSubmit} className="w-full">
              Retry Password Reset
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <h2 className="mb-6 text-center text-2xl font-bold">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={isLoading}
              error={error}
            />
          </div>
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Reset Password
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => navigate('/login')}
            disabled={isLoading}
          >
            Back to Login
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => navigate('/support')}
            disabled={isLoading}
          >
            Contact Support
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            Retry Password Reset
          </Button>
        </form>
      </Card>
    </div>
  )
}
