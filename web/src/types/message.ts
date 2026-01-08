export interface Message {
  id: string
  conversationId: string
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'
  content: string
  createdAt: Date
}

export interface Conversation {
  id: string
  status: 'OPEN' | 'TRANSFERRED' | 'CLOSED'
  department: 'SALES' | 'SUPPORT' | 'FINANCE' | null
  summary: string | null
  createdAt: Date
  updatedAt: Date
  messages: Message[]
}

export interface SendMessageRequest {
  conversationId?: string
  content: string
}
