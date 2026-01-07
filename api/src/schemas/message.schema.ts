import { z } from 'zod'

// Schema para criar uma mensagem
export const createMessageSchema = z.object({
  conversationId: z
    .string()
    .cuid()
    .optional()
    .describe('ID da conversa existente (opcional para nova conversa)'),
  content: z
    .string()
    .min(1, 'Mensagem não pode ser vazia')
    .max(2000, 'Mensagem muito longa')
    .describe('Conteúdo da mensagem do usuário'),
})

export type CreateMessageInput = z.infer<typeof createMessageSchema>

// Schema para buscar uma conversa
export const getConversationSchema = z.object({
  conversationId: z.string().cuid(),
})

export type GetConversationInput = z.infer<typeof getConversationSchema>

// Schema de resposta de mensagem
export const messageResponseSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  role: z.string(),
  content: z.string(),
  createdAt: z.date(),
})

// Schema de resposta de conversa
export const conversationResponseSchema = z.object({
  id: z.string(),
  status: z.string(),
  department: z.string().nullable(),
  summary: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  messages: z.array(messageResponseSchema),
})

export type ConversationResponse = z.infer<typeof conversationResponseSchema>
