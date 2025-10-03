import { z } from 'zod'

export const MemorySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  agent_id: z.string().uuid().optional(),
  type: z.enum(['episodic', 'semantic', 'procedural']),
  content: z.string(),
  embedding: z.array(z.number()).optional(),
  metadata: z.record(z.unknown()),
  importance: z.number().min(0).max(1),
  last_accessed: z.string().datetime(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Memory = z.infer<typeof MemorySchema>

export const CreateMemorySchema = MemorySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export type CreateMemory = z.infer<typeof CreateMemorySchema>
