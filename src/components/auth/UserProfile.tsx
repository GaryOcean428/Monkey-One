/**
 * User Profile Component
 *
 * Displays user information and provides sign-out functionality
 */

import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/button'
import { Avatar } from '../ui/Avatar'
import { LogOut, User, Shield } from 'lucide-react'

interface UserProfileProps {
  className?: string
}

export function UserProfile({ className }: UserProfileProps): JSX.Element | null {
  const { user, isAuthenticated, signOut, oidcToken, gcpCredentials, supabaseProfile } = useAuth()
  const [isOpen, setIsOpen] = React.useState(false)

  if (!isAuthenticated || !user) {
    return null
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsOpen(false)
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('[data-user-profile]')) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" data-user-profile>
      <Button
        variant="ghost"
        className={`relative h-8 w-8 rounded-full ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar
          src={user.picture}
          alt={user.name || 'User'}
          fallback={getInitials(user.name || 'User')}
          className="h-8 w-8"
        />
      </Button>

      {isOpen && (
        <div className="absolute top-10 right-0 z-50 w-56 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-3 py-2 dark:border-gray-700">
            <div className="flex flex-col space-y-1">
              <p className="text-sm leading-none font-medium">{user.name || 'User'}</p>
              <p className="text-xs leading-none text-gray-500 dark:text-gray-400">{user.email || 'No email'}</p>
            </div>
          </div>

          <div className="py-1">
            <button
              className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
              disabled
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="px-3 py-2">
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <Shield className="h-3 w-3" />
                <span>Auth Status</span>
              </div>
              <div className="mt-1 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Google OAuth:</span>
                  <span className="text-green-600">✓ Active</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Vercel OIDC:</span>
                  <span className={oidcToken ? 'text-green-600' : 'text-yellow-600'}>
                    {oidcToken ? '✓ Active' : '⚠ Limited'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>GCP Access:</span>
                  <span className={gcpCredentials ? 'text-green-600' : 'text-gray-500'}>
                    {gcpCredentials ? '✓ Available' : '○ N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Supabase:</span>
                  <span className={supabaseProfile ? 'text-green-600' : 'text-red-600'}>
                    {supabaseProfile ? '✓ Synced' : '✗ Not Synced'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 py-1 dark:border-gray-700">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
