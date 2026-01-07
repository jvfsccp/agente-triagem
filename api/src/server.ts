import { fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { fastifySwagger } from '@fastify/swagger'
import { fastifyCors } from '@fastify/cors'
import ScalarApiReference from '@scalar/fastify-api-reference'
import { messageRoutes } from './routes/message.routes'

async function start() {
  const app = fastify()

  await app.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  // Registra Swagger antes de tudo
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Agente de Triagem API',
        description:
          'API para sistema de triagem inteligente com IA. O assistente classifica atendimentos em Vendas, Suporte ou Financeiro.',
        version: '1.0.0',
      },
      tags: [
        {
          name: 'messages',
          description: 'Endpoints para gerenciar mensagens e conversas',
        },
      ],
    },
  })

  // Rota raiz
  app.get('/', async () => {
    return {
      message: 'Agente de Triagem API',
      docs: '/docs',
      health: '/health',
    }
  })

  // Health check
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  // Registra as rotas
  await app.register(messageRoutes)

  // Registra Scalar depois das rotas para capturar o schema
  await app.register(ScalarApiReference, {
    routePrefix: '/docs',
  })

  const PORT = 3333

  await app.listen({ port: PORT, host: '0.0.0.0' })
  console.log(`🚀 HTTP server running on http://localhost:${PORT}`)
  console.log(`📚 Docs available at http://localhost:${PORT}/docs`)
}

start().catch((err) => {
  console.error('Erro ao iniciar servidor:', err)
  process.exit(1)
})
