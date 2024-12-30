import { z } from 'zod';

export const ToolSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string(),
  type: z.enum(['system', 'custom']),
  configuration: z.record(z.unknown()),
  permissions: z.array(z.string()),
  version: z.string(),
  status: z.enum(['active', 'inactive', 'deprecated']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Tool = z.infer<typeof ToolSchema>;

export const CreateToolSchema = ToolSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type CreateTool = z.infer<typeof CreateToolSchema>;
