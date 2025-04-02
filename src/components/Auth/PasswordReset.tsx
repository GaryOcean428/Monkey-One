import React from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../hooks/useAuth'

export function PasswordReset() {
  const navigate = useNavigate()
  const { resetPassword } = useAuth()
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [error, setError] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      await resetPassword(password)
      navigate('/auth/login')
    } catch (error) {
      setError('Failed to reset password')
      console.error('Password reset error:', error)
    }
  }

  return (
    <div className="password-reset">
      <h2>Reset Password</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="password">New Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="confirm-password">Confirm Password</label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Reset Password</button>
      </form>
    </div>
  )
}
