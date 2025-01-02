import { z } from 'zod'

// Profile schema for validation
export const CreateProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  preferences: z
    .object({
      theme: z.enum(['light', 'dark', 'system']).default('system'),
      notifications: z.boolean().default(true),
      language: z.string().default('en'),
    })
    .optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})

export const UpdateProfileSchema = CreateProfileSchema.partial().omit({ id: true })

// Profile type definitions
export type CreateProfileInput = z.infer<typeof CreateProfileSchema>
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>

// Base profile interface with required fields
export interface BaseProfile {
  id: string
  createdAt: Date
  updatedAt: Date
}

// Full profile interface with optional fields
export interface Profile extends BaseProfile {
  name: string
  email: string
  preferences?: {
    theme: 'light' | 'dark' | 'system'
    notifications: boolean
    language: string
  }
}

// Profile model class
export class ProfileModel {
  async create(data: CreateProfileInput): Promise<Profile> {
    const validated = CreateProfileSchema.parse(data)
    // Implementation will be added when database service is ready
    return validated as Profile
  }

  async update(id: string, data: UpdateProfileInput): Promise<Profile> {
    const validated = UpdateProfileSchema.parse(data)
    const existing = await this.getById(id)

    // Merge existing data with updates
    return {
      ...existing,
      ...validated,
      updatedAt: new Date(),
    }
  }

  async getById(id: string): Promise<Profile> {
    // Implementation will be added when database service is ready
    return {
      id,
      name: 'Default User',
      email: 'user@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      preferences: {
        theme: 'system',
        notifications: true,
        language: 'en',
      },
    }
  }

  async delete(_id: string): Promise<void> {
    // Implementation will be added when database service is ready
  }
}
