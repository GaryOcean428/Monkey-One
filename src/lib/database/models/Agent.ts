import { z } from 'zod'

export const AgentSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  capabilities: z.array(z.string()),
  configuration: z.record(z.unknown()),
  status: z.enum(['active', 'inactive', 'learning', 'error']),
  memory_id: z.string().uuid().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Agent = z.infer<typeof AgentSchema>

export const CreateAgentSchema = AgentSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export type CreateAgent = z.infer<typeof CreateAgentSchema>
