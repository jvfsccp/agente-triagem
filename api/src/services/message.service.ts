import { prisma } from '../lib/prisma'
import { AIService } from './ai.service'

type ConversationStatus = 'OPEN' | 'TRANSFERRED'
type Department = 'SALES' | 'SUPPORT' | 'FINANCE'
type MessageRole = 'USER' | 'ASSISTANT'

interface CreateMessageInput {
  conversationId?: string
  content: string
}

interface MessageOutput {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  createdAt: Date
}

interface ConversationOutput {
  id: string
  status: ConversationStatus
  department: Department | null
  summary: string | null
  createdAt: Date
  updatedAt: Date
  messages: MessageOutput[]
}

export class MessageService {
  private aiService: AIService

  constructor() {
    this.aiService = new AIService()
  }

  async createMessage(input: CreateMessageInput): Promise<ConversationOutput> {
    const { conversationId, content } = input

    // Se não há conversationId, cria uma nova conversa
    let conversation = conversationId
      ? await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
            },
          },
        })
      : null

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          status: 'OPEN',
        },
        include: {
          messages: true,
        },
      })
    }

    // Verifica se a conversa já foi transferida
    if (conversation.status === 'TRANSFERRED') {
      throw new Error(
        'Esta conversa já foi transferida para um atendente humano.'
      )
    }

    // Cria a mensagem do usuário
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content,
      },
    })

    // Prepara o histórico para a IA
    const history = conversation.messages.map((msg) => ({
      role: msg.role === 'USER' ? ('user' as const) : ('assistant' as const),
      content: msg.content,
    }))

    // Analisa a mensagem com IA
    const analysis = await this.aiService.analyzeMessage(history, content)

    // Cria a resposta do assistente
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: analysis.message,
      },
    })

    // Se deve transferir, atualiza a conversa
    if (analysis.shouldTransfer && analysis.department) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          status: 'TRANSFERRED',
          department: analysis.department,
          summary: analysis.summary || null,
        },
      })
    }

    // Retorna a conversa atualizada
    const updatedConversation = await prisma.conversation.findUnique({
      where: { id: conversation.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!updatedConversation) {
      throw new Error('Erro ao buscar conversa atualizada')
    }

    return updatedConversation as ConversationOutput
  }

  async getConversation(
    conversationId: string
  ): Promise<ConversationOutput | null> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return conversation as ConversationOutput | null
  }

  async getAllConversations(): Promise<ConversationOutput[]> {
    const conversations = await prisma.conversation.findMany({
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return conversations as ConversationOutput[]
  }
}
