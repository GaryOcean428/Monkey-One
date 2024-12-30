import { z } from 'zod';

export const MessageSchema = z.object({
  id: z.string().uuid(),
  chat_id: z.string().uuid(),
  user_id: z.string().uuid(),
  agent_id: z.string().uuid().optional(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  metadata: z.record(z.unknown()),
  created_at: z.string().datetime(),
});

export type Message = z.infer<typeof MessageSchema>;

export const ChatSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  participants: z.array(z.string().uuid()),
  status: z.enum(['active', 'archived', 'deleted']),
  metadata: z.record(z.unknown()),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  messages: z.array(MessageSchema).optional(),
});

export type Chat = z.infer<typeof ChatSchema>;

export const CreateChatSchema = ChatSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  messages: true,
});

export type CreateChat = z.infer<typeof CreateChatSchema>;

export const CreateMessageSchema = MessageSchema.omit({
  id: true,
  created_at: true,
});

export type CreateMessage = z.infer<typeof CreateMessageSchema>;
