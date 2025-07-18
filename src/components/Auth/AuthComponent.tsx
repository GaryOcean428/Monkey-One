import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import './AuthComponent.css'

export function AuthComponent() {
  const {
    user,
    loading,
    error,
    signInWithEmail,
    signUpWithEmail,
    signInWithProvider,
    signOut,
    linkIdentity,
    resetPassword,
  } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  if (loading) return <div>Loading...</div>

  if (user) {
    return (
      <div className="auth-container">
        <div className="auth-content">
          <h2>Welcome {user.email}</h2>
          <div>
            <h3>Link another account</h3>
            <button onClick={() => linkIdentity('google')}>Link Google Account</button>
            <button onClick={() => linkIdentity('github')}>Link GitHub Account</button>
          </div>
          <button onClick={() => signOut()}>Sign Out</button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-content">
        <h2>Authentication</h2>
        {error && <div className="error-message">{error.message}</div>}

        <div>
          <h3>Email/Password</h3>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button onClick={() => signInWithEmail(email, password)}>Sign In</button>
          <button onClick={() => signUpWithEmail(email, password)}>Sign Up</button>
        </div>

        <div>
          <h3>Social Login</h3>
          <button onClick={() => signInWithProvider('google')}>Sign in with Google</button>
          <button onClick={() => signInWithProvider('github')}>Sign in with GitHub</button>
        </div>

        <div>
          <button onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
          <button onClick={() => resetPassword(email)}>Reset Password</button>
        </div>
      </div>
    </div>
  )
}
