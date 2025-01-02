import React, { useState } from 'react'
import { useAuth } from '../auth/hooks/useAuth'

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
  } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (loading) return <div>Loading...</div>

  if (user) {
    return (
      <div>
        <h2>Welcome {user.email}</h2>
        <div>
          <h3>Link another account</h3>
          <button onClick={() => linkIdentity('google')}>Link Google Account</button>
          <button onClick={() => linkIdentity('github')}>Link GitHub Account</button>
        </div>
        <button onClick={() => signOut()}>Sign Out</button>
      </div>
    )
  }

  return (
    <div>
      <h2>Authentication</h2>
      {error && <div style={{ color: 'red' }}>{error.message}</div>}

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
    </div>
  )
}
