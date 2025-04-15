'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Icons } from '@/components/ui/icons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@supabase/supabase-js'
import { motion } from 'framer-motion'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const formSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must include uppercase, lowercase, number and special character'
      ),
    confirmPassword: z.string().optional(),
  })
  .refine(
    data => {
      if (data.confirmPassword !== undefined) {
        return data.password === data.confirmPassword
      }
      return true
    },
    {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }
  )

type FormData = z.infer<typeof formSchema>

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = React.useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      setError(null)

      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        })
        if (signUpError) throw signUpError
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        })
        if (signInError) throw signInError
      }

      reset()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.')
      console.error('Authentication error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Reset form and error state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      reset()
      setError(null)
    }
  }, [isOpen, reset])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isSignUp ? 'Sign up to get started' : 'Sign in to your account to continue'}
          </DialogDescription>
        </DialogHeader>

        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className={cn(
                  'transition-all duration-200',
                  errors.email && 'border-destructive focus-visible:ring-destructive'
                )}
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <motion.p
                  className="text-sm text-destructive"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                className={cn(
                  'transition-all duration-200',
                  errors.password && 'border-destructive focus-visible:ring-destructive'
                )}
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <motion.p
                  className="text-sm text-destructive"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  className={cn(
                    'transition-all duration-200',
                    errors.confirmPassword && 'border-destructive focus-visible:ring-destructive'
                  )}
                  {...register('confirmPassword')}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <motion.p
                    className="text-sm text-destructive"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.confirmPassword.message}
                  </motion.p>
                )}
              </div>
            )}
          </div>

          {error && (
            <motion.div
              className="rounded-md bg-destructive/15 p-3 text-sm text-destructive"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </>
              ) : isSignUp ? (
                'Create account'
              ) : (
                'Sign in'
              )}
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => {
                setIsSignUp(!isSignUp)
                reset()
                setError(null)
              }}
              disabled={isLoading}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={async () => {
                try {
                  setIsLoading(true)
                  setError(null)
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'github',
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback`,
                    },
                  })
                  if (error) throw error
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to sign in with GitHub')
                  console.error('GitHub auth error:', err)
                } finally {
                  setIsLoading(false)
                }
              }}
              disabled={isLoading}
            >
              <Icons.gitHub className="mr-2 h-4 w-4" />
              GitHub
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={async () => {
                try {
                  setIsLoading(true)
                  setError(null)
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback`,
                    },
                  })
                  if (error) throw error
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to sign in with Google')
                  console.error('Google auth error:', err)
                } finally {
                  setIsLoading(false)
                }
              }}
              disabled={isLoading}
            >
              <Icons.google className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => {
                reset()
                setError(null)
              }}
              disabled={isLoading}
            >
              Reset Password
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  )
}
