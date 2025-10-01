/**
 * User Synchronization Service
 *
 * Handles syncing Google OAuth users with Supabase database
 */

import { supabase } from '../supabase/client'
import { GoogleUser } from './google-auth'

export interface SupabaseProfile {
  id: string
  user_id: string
  username: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
  updated_at: string
  preferences?: {
    theme: 'light' | 'dark' | 'system'
    language: string
    notifications: boolean
  }
}

/**
 * Sync Google OAuth user to Supabase
 */
export async function syncGoogleUserToSupabase(googleUser: GoogleUser): Promise<SupabaseProfile | null> {
  try {
    // First, sign in the user to Supabase using their Google email
    // This creates a Supabase auth user if one doesn't exist
    const { data: authData, error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        skipBrowserRedirect: true,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (authError) {
      console.warn('Supabase OAuth sign-in failed, creating manual profile:', authError)
      return await createManualProfile(googleUser)
    }

    // Check if profile already exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', googleUser.email)
      .single()

    if (existingProfile && !profileError) {
      // Update existing profile with latest Google data
      return await updateProfile(existingProfile.id, googleUser)
    }

    // Create new profile
    return await createProfile(googleUser)
  } catch (error) {
    console.error('Failed to sync Google user to Supabase:', error)
    return null
  }
}

/**
 * Create a new profile in Supabase
 */
async function createProfile(googleUser: GoogleUser): Promise<SupabaseProfile | null> {
  try {
    const profileData = {
      user_id: googleUser.id, // Use Google ID as user_id
      username: generateUsername(googleUser.email),
      email: googleUser.email,
      name: googleUser.name,
      avatar_url: googleUser.picture,
      preferences: {
        theme: 'system' as const,
        language: 'en',
        notifications: true,
      },
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single()

    if (error) {
      console.error('Failed to create profile:', error)
      return null
    }

    console.log('Created new Supabase profile for Google user:', googleUser.email)
    return data
  } catch (error) {
    console.error('Error creating profile:', error)
    return null
  }
}

/**
 * Create manual profile when OAuth fails
 */
async function createManualProfile(googleUser: GoogleUser): Promise<SupabaseProfile | null> {
  try {
    // Generate a unique ID for manual profiles
    const manualUserId = `google_${googleUser.id}`
    
    const profileData = {
      user_id: manualUserId,
      username: generateUsername(googleUser.email),
      email: googleUser.email,
      name: googleUser.name,
      avatar_url: googleUser.picture,
      preferences: {
        theme: 'system' as const,
        language: 'en',
        notifications: true,
      },
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single()

    if (error) {
      console.error('Failed to create manual profile:', error)
      return null
    }

    console.log('Created manual Supabase profile for Google user:', googleUser.email)
    return data
  } catch (error) {
    console.error('Error creating manual profile:', error)
    return null
  }
}

/**
 * Update existing profile with Google data
 */
async function updateProfile(profileId: string, googleUser: GoogleUser): Promise<SupabaseProfile | null> {
  try {
    const updateData = {
      name: googleUser.name,
      avatar_url: googleUser.picture,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', profileId)
      .select()
      .single()

    if (error) {
      console.error('Failed to update profile:', error)
      return null
    }

    console.log('Updated Supabase profile for Google user:', googleUser.email)
    return data
  } catch (error) {
    console.error('Error updating profile:', error)
    return null
  }
}

/**
 * Generate username from email
 */
function generateUsername(email: string): string {
  const baseUsername = email.split('@')[0].toLowerCase()
  // Remove special characters and limit length
  return baseUsername.replace(/[^a-z0-9]/g, '').substring(0, 20)
}

/**
 * Get Supabase profile by Google user
 */
export async function getSupabaseProfile(googleUser: GoogleUser): Promise<SupabaseProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', googleUser.email)
      .single()

    if (error) {
      console.error('Failed to get profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error getting profile:', error)
    return null
  }
}

/**
 * Delete user profile (for cleanup)
 */
export async function deleteUserProfile(email: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('email', email)

    if (error) {
      console.error('Failed to delete profile:', error)
      return false
    }

    console.log('Deleted profile for user:', email)
    return true
  } catch (error) {
    console.error('Error deleting profile:', error)
    return false
  }
}

/**
 * Check if user exists in Supabase
 */
export async function userExistsInSupabase(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    return !error && !!data
  } catch (error) {
    return false
  }
}