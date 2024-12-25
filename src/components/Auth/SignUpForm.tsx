import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useToast } from '../ui/use-toast'

interface AuthSwitchProps {
  onSwitch: () => void;
}

export function SignUpForm({ onSwitch }: AuthSwitchProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { signUp } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await signUp(email, password, {
        data: { full_name: fullName }
      })
      toast({
        title: 'Success!',
        description: 'Account created successfully. Please check your email for verification.',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign up')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An error occurred during sign up',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="w-full max-w-md p-6 space-y-4 bg-card rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center">Sign Up</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <div>
          <Input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Sign Up
        </Button>
      </form>
      <div className="text-center">
        <Button variant="link" onClick={onSwitch}>
          Already have an account? Sign in
        </Button>
      </div>
    </div>
  )
}
