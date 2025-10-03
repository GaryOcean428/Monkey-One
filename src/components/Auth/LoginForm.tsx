import React, { useState } from 'react'
import { useAuth } from '../auth/hooks/useAuth'
import { NeonMonkey } from '../Logo/NeonMonkey'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('LoginForm: Attempting to sign in...')
    try {
      await signIn(email, password)
      console.log('LoginForm: Sign in successful')
    } catch (error) {
      console.error('LoginForm: Sign in failed:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-8 flex justify-center">
        <NeonMonkey size="lg" animated={true} />
      </div>
      <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
        Welcome Back
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700 dark:border-red-600 dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-indigo-400"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-indigo-400"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          Sign In
        </button>
      </form>
    </div>
  )
}
