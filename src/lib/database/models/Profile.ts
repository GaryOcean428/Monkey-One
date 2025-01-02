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

export interface Profile extends CreateProfileInput {
  id: string
  createdAt: Date
  updatedAt: Date
}

// Profile model class
export class ProfileModel {
  private readonly tableName = 'profiles'

  async create(data: CreateProfileInput): Promise<Profile> {
    const validated = CreateProfileSchema.parse(data)
    // Implementation will be added when database service is ready
    return validated
  }

  async update(id: string, data: UpdateProfileInput): Promise<Profile> {
    const validated = UpdateProfileSchema.parse(data)
    // Implementation will be added when database service is ready
    return {
      ...validated,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  async delete(_id: string): Promise<void> {
    // Implementation will be added when database service is ready
  }

  async findById(_id: string): Promise<Profile | null> {
    // Implementation will be added when database service is ready
    return null
  }

  async findByEmail(_email: string): Promise<Profile | null> {
    // Implementation will be added when database service is ready
    return null
  }
}
