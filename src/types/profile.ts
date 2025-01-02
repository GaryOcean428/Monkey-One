export interface Profile {
  id: string
  name: string
  email: string
  bio?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface UseProfileReturn {
  profile: Profile | null
  isLoading: boolean
  error: Error | null
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}
