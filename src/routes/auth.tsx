import React from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'react-hot-toast'

export function AuthCallback() {
  const navigate = useNavigate()
  const { user } = useAuth()

  React.useEffect(() => {
    if (user) {
      toast.success('Successfully authenticated!')
      navigate('/dashboard')
    }
  }, [user, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8">
        <h1 className="mb-6 text-center text-2xl font-bold">Authenticating...</h1>
        <div className="flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
        </div>
      </div>
    </div>
  )
}

export function PasswordReset() {
  const navigate = useNavigate()
  const { resetPassword } = useAuth()
  const [email, setEmail] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await resetPassword(email)
      if (result.error) {
        toast.error(result.error.message)
      } else {
        toast.success('Password reset email sent!')
        navigate('/auth/login')
      }
    } catch (err) {
      toast.error('Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8">
        <h1 className="mb-6 text-center text-2xl font-bold">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  )
}
