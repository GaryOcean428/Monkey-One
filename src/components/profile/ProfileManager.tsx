// Global type declarations
/// <reference types="react/global" />

// React imports
import type { 
  ChangeEvent, 
  FormEvent
} from 'react'

import { useState, useCallback } from 'react'

// Third-party imports
import { toast } from 'react-hot-toast'

// Local imports
import { useAuth } from '../../hooks/useAuth'

// Constants
const THEME_OPTIONS = ['light', 'dark'] as const
type ThemeOption = typeof THEME_OPTIONS[number]

// Types
interface Profile {
  username: string
  bio: string
  preferences: {
    theme: ThemeOption
    notifications: boolean
  }
}

interface FormField {
  id: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'checkbox'
  name: string
  ariaLabel: string
}

const FORM_FIELDS: FormField[] = [
  {
    id: 'username',
    label: 'Username',
    type: 'text',
    name: 'username',
    ariaLabel: 'Enter your username'
  },
  {
    id: 'bio',
    label: 'Bio',
    type: 'textarea',
    name: 'bio',
    ariaLabel: 'Enter your bio'
  },
  {
    id: 'theme',
    label: 'Theme',
    type: 'select',
    name: 'preferences.theme',
    ariaLabel: 'Select your preferred theme'
  },
  {
    id: 'notifications',
    label: 'Enable notifications',
    type: 'checkbox',
    name: 'preferences.notifications',
    ariaLabel: 'Toggle notifications'
  }
]

/**
 * ProfileManager component for handling user profile settings
 * Allows users to update their profile information including username, bio, theme, and notification preferences
 */
export function ProfileManager() {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profile, setProfile] = useState<Profile>({
    username: '',
    bio: '',
    preferences: {
      theme: 'light',
      notifications: true
    }
  })

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setProfile(prev => {
      if (name.includes('.')) {
        const [section, field] = name.split('.')
        if (section === 'preferences') {
          return {
            ...prev,
            preferences: {
              ...prev.preferences,
              [field]: type === 'checkbox'
                ? (e.target as HTMLInputElement).checked
                : value
            }
          }
        }
      }
      
      if (name === 'username' || name === 'bio') {
        return {
          ...prev,
          [name]: value
        }
      }
      
      return prev
    })
  }, [])

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('You must be logged in to update your profile')
      return
    }

    try {
      setIsSubmitting(true)
      // TODO: Implement profile update logic
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated API call
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }, [user])

  if (!user) {
    return (
      <div className="text-center p-4" role="alert">
        Please log in to manage your profile
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-6" aria-label="Profile settings form">
        {FORM_FIELDS.map(field => (
          <div key={field.id}>
            <label
              htmlFor={field.id}
              className="block text-sm font-medium text-gray-700"
            >
              {field.label}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                id={field.id}
                name={field.name}
                value={profile.bio}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                aria-label={field.ariaLabel}
              />
            ) : field.type === 'select' ? (
              <select
                id={field.id}
                name={field.name}
                value={profile.preferences.theme}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                aria-label={field.ariaLabel}
              >
                {THEME_OPTIONS.map(theme => (
                  <option key={theme} value={theme}>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </option>
                ))}
              </select>
            ) : field.type === 'checkbox' ? (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={field.id}
                  name={field.name}
                  checked={profile.preferences.notifications}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  aria-label={field.ariaLabel}
                />
                <label
                  htmlFor={field.id}
                  className="ml-2 block text-sm text-gray-700"
                >
                  {field.label}
                </label>
              </div>
            ) : (
              <input
                type={field.type}
                id={field.id}
                name={field.name}
                value={field.name === 'username' ? profile.username : profile.bio}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                aria-label={field.ariaLabel}
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent
            rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600
            hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2
            focus:ring-indigo-500 disabled:opacity-50"
          aria-label="Save profile changes"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
