# 🤖 Agente de Triagem Inteligente com IA

Sistema de triagem automatizada de atendimento ao cliente utilizando IA (Groq/LLaMA) para classificar solicitações em Vendas, Suporte ou Financeiro.

## 🎯 Objetivo

O assistente de IA interage com clientes para identificar suas necessidades e encaminhá-los automaticamente para o setor correto (Vendas, Suporte/Reclamação ou Financeiro), gerando um resumo da solicitação para o atendente humano.

## 🛠️ Stack Tecnológica

- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset tipado do JavaScript
- **Fastify** - Framework web rápido e eficiente
- **Prisma** - ORM moderno para banco de dados
- **SQLite** - Banco de dados leve e embutido
- **Zod** - Validação de schemas TypeScript
- **Scalar** - Documentação interativa de API
- **Swagger** - Especificação OpenAPI
- **Groq SDK** - Integração com LLM (LLaMA 3.3 70B)

## 📋 Pré-requisitos

- Node.js 18+ instalado
- pnpm instalado (`npm install -g pnpm`)
- Conta no Groq Cloud (gratuita) - [https://console.groq.com](https://console.groq.com)

## 🚀 Configuração

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd api
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione sua chave da API do Groq:

```env
DATABASE_URL="file:./dev.db"
GROQ_API_KEY="sua_chave_aqui"
PORT=3333
```

**Como obter a chave do Groq:**

1. Acesse [https://console.groq.com](https://console.groq.com)
2. Faça login ou crie uma conta gratuita
3. Vá em "API Keys" e gere uma nova chave
4. Copie e cole no arquivo `.env`

### 4. Execute as migrations do banco

```bash
pnpm prisma migrate dev
```

### 5. Inicie o servidor

```bash
pnpm dev
```

O servidor estará rodando em `http://localhost:3333`

## 📚 Documentação da API

Acesse a documentação interativa em: `http://localhost:3333/docs`

### Endpoints Principais

#### POST /messages

Envia uma mensagem e recebe resposta automática da IA.

**Body:**

```json
{
  "conversationId": "opcional - ID da conversa existente",
  "content": "Sua mensagem aqui"
}
```

**Resposta:**

```json
{
  "id": "clxxx...",
  "status": "OPEN",
  "department": null,
  "summary": null,
  "createdAt": "2026-01-06T...",
  "updatedAt": "2026-01-06T...",
  "messages": [
    {
      "id": "clyyy...",
      "role": "USER",
      "content": "Gostaria de pagar meu boleto",
      "createdAt": "2026-01-06T..."
    },
    {
      "id": "clzzz...",
      "role": "ASSISTANT",
      "content": "Com certeza! Posso te ajudar com isso...",
      "createdAt": "2026-01-06T..."
    }
  ]
}
```

#### GET /messages/:conversationId

Busca uma conversa específica com todo o histórico.

#### GET /messages

Lista todas as conversas.

#### GET /health

Health check da API.

## 🎭 Comportamento da IA

### Regras de Triagem

1. **Coleta de Intenção:** A IA inicia o atendimento de forma amigável e identifica o motivo do contato em poucas interações.

2. **Classificação de Filas:**

   - **SALES (Vendas):** Compra, dúvidas sobre produto ou preços
   - **SUPPORT (Suporte):** Reclamações sobre atraso, erro ou problemas com o produto
   - **FINANCE (Financeiro):** Problemas com pagamento, estorno ou nota fiscal

3. **Transferência:** Quando a intenção fica clara, o bot informa a transferência para atendente humano e encerra sua participação.

4. **Resumo para Humano:** A IA gera um resumo da solicitação para facilitar o atendimento.

5. **Contexto Restrito:** Se o usuário tentar mudar para assuntos não relacionados, a IA informa que não tem autorização.

### Exemplos de Uso

**Fluxo de Pagamento:**

```
Cliente: "Gostaria de pagar meu boleto que vence hoje."
IA: "Com certeza! Posso te ajudar com isso agora mesmo..."
```

**Fluxo de Suporte:**

```
Cliente: "Eu paguei o boleto ontem, mas meu acesso ainda está bloqueado."
IA: "Sinto muito pelo transtorno. Vou te transferir para o Suporte..."
```

**Fora de Contexto:**

```
Cliente: "Vocês sabem se vai chover hoje?"
IA: "Sinto muito, mas não tenho autorização para falar sobre a previsão do tempo..."
```

## 📁 Estrutura do Projeto

```
api/
├── prisma/
│   ├── schema.prisma        # Schema do banco de dados
│   └── migrations/          # Migrations do Prisma
├── src/
│   ├── generated/
│   │   └── prisma/         # Cliente Prisma gerado
│   ├── lib/
│   │   ├── prisma.ts       # Instância do Prisma Client
│   │   └── groq.ts         # Instância do cliente Groq
│   ├── services/
│   │   ├── ai.service.ts   # Lógica de IA e análise
│   │   └── message.service.ts # Lógica de mensagens
│   ├── routes/
│   │   └── message.routes.ts # Rotas da API
│   ├── schemas/
│   │   └── message.schema.ts # Schemas Zod
│   └── server.ts           # Configuração do servidor
├── .env                    # Variáveis de ambiente
├── package.json
├── tsconfig.json
└── README.md
```

## 🧪 Testes

Para testar a API, você pode usar:

1. **Scalar Docs** - `http://localhost:3333/docs`
2. **Postman/Insomnia** - Importe os exemplos acima
3. **cURL:**

```bash
# Criar nova conversa
curl -X POST http://localhost:3333/messages \
  -H "Content-Type: application/json" \
  -d '{"content": "Gostaria de pagar meu boleto"}'

# Continuar conversa existente
curl -X POST http://localhost:3333/messages \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "clxxx...", "content": "Tenho o CPF aqui"}'

# Listar conversas
curl http://localhost:3333/messages
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento com hot reload
pnpm dev

# Build para produção
pnpm build

# Iniciar em produção
pnpm start

# Gerar cliente Prisma
pnpm prisma generate

# Criar migration
pnpm prisma migrate dev

# Abrir Prisma Studio
pnpm prisma studio
```

## 🎯 Próximos Passos

- [ ] Implementar WebSocket para respostas em tempo real
- [ ] Adicionar testes automatizados (Jest/Vitest)
- [ ] Dockerizar a aplicação
- [ ] Criar frontend React
- [ ] Implementar autenticação
- [ ] Adicionar logs estruturados
- [ ] Métricas e monitoramento
