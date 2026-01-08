import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { MessageService } from '../services/message.service'
import {
  createMessageSchema,
  getConversationSchema,
  conversationResponseSchema,
} from '../schemas/message.schema'

export async function messageRoutes(app: FastifyInstance) {
  const messageService = new MessageService()

  // POST /messages - Envia uma mensagem e recebe resposta da IA
  app.post(
    '/messages',
    {
      schema: {
        summary: 'Enviar mensagem',
        description:
          'Envia uma mensagem para o assistente de IA e recebe uma resposta automática. Se não informar conversationId, cria uma nova conversa.',
        tags: ['messages'],
        body: {
          type: 'object',
          required: ['content'],
          properties: {
            conversationId: {
              type: 'string',
              description:
                'ID da conversa existente (opcional para nova conversa)',
            },
            content: {
              type: 'string',
              description: 'Conteúdo da mensagem do usuário',
              minLength: 1,
              maxLength: 2000,
            },
          },
          examples: [
            {
              content: 'Gostaria de pagar meu boleto que vence hoje.',
            },
          ],
        },
      },
    },
    async (request, reply) => {
      try {
        const { conversationId, content } = request.body as {
          conversationId?: string
          content: string
        }

        const conversation = await messageService.createMessage({
          conversationId,
          content,
        })

        return reply.status(200).send(conversation)
      } catch (error) {
        if (error instanceof Error) {
          return reply.status(400).send({
            error: error.message,
          })
        }
        return reply.status(500).send({
          error: 'Erro interno do servidor',
        })
      }
    }
  )

  // GET /messages/:conversationId - Busca uma conversa específica
  app.get(
    '/messages/:conversationId',
    {
      schema: {
        summary: 'Buscar conversa',
        description: 'Busca o histórico de uma conversa específica',
        tags: ['messages'],
        params: {
          type: 'object',
          properties: {
            conversationId: { type: 'string' },
          },
          required: ['conversationId'],
        },
      },
    },
    async (request, reply) => {
      try {
        const { conversationId } = request.params as { conversationId: string }

        const conversation = await messageService.getConversation(
          conversationId
        )

        if (!conversation) {
          return reply.status(404).send({
            error: 'Conversa não encontrada',
          })
        }

        return reply.status(200).send(conversation)
      } catch (error) {
        return reply.status(500).send({
          error: 'Erro ao buscar conversa',
        })
      }
    }
  )

  // GET /messages - Lista todas as conversas
  app.get(
    '/messages',
    {
      schema: {
        summary: 'Listar conversas',
        description: 'Lista todas as conversas com filtros opcionais',
        tags: ['messages'],
        querystring: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['OPEN', 'TRANSFERRED', 'CLOSED'],
              description: 'Filtrar por status da conversa',
            },
            department: {
              type: 'string',
              enum: ['SALES', 'SUPPORT', 'FINANCE'],
              description: 'Filtrar por departamento',
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { status, department } = request.query as {
          status?: 'OPEN' | 'TRANSFERRED' | 'CLOSED'
          department?: 'SALES' | 'SUPPORT' | 'FINANCE'
        }

        const conversations = await messageService.getAllConversations({
          status,
          department,
        })

        return reply.status(200).send(conversations)
      } catch (error) {
        return reply.status(500).send({
          error: 'Erro ao listar conversas',
        })
      }
    }
  )

  // GET /queues - Resumo das filas por departamento
  app.get(
    '/queues',
    {
      schema: {
        summary: 'Resumo das filas',
        description:
          'Retorna o resumo de conversas por departamento e status',
        tags: ['messages'],
      },
    },
    async (request, reply) => {
      try {
        const queues = await messageService.getQueuesOverview()
        return reply.status(200).send(queues)
      } catch (error) {
        return reply.status(500).send({
          error: 'Erro ao buscar resumo das filas',
        })
      }
    }
  )
}
