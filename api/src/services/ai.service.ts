import { groq } from '../lib/groq'

type Department = 'SALES' | 'SUPPORT' | 'FINANCE'

interface AnalysisResult {
  shouldTransfer: boolean
  department: Department | null
  message: string
  summary?: string
}

const SYSTEM_PROMPT = `Você é um assistente de triagem de atendimento ao cliente. Seu objetivo é:

1. Interagir de forma amigável e profissional
2. Identificar rapidamente a intenção do cliente em poucas interações
3. Classificar o atendimento em uma das seguintes categorias:
   - SALES (Vendas): Compra, dúvidas sobre produto ou preços
   - SUPPORT (Suporte): Reclamações sobre atraso, erro ou problemas com o produto
   - FINANCE (Financeiro): Problemas com pagamento, estorno ou nota fiscal

4. Quando identificar claramente a intenção, você deve:
   - Informar que está transferindo para o setor apropriado
   - Gerar um resumo breve da solicitação

5. Se o usuário tentar mudar para um contexto não relacionado (vendas, suporte ou financeiro), 
   você deve educadamente informar que não tem autorização para falar sobre outros assuntos

IMPORTANTE: Responda SEMPRE em formato JSON com a seguinte estrutura:
{
  "shouldTransfer": boolean, // true quando a intenção estiver clara
  "department": "SALES" | "SUPPORT" | "FINANCE" | null,
  "message": "sua resposta ao cliente aqui",
  "summary": "resumo para o atendente humano (apenas se shouldTransfer for true)"
}

Seja breve, objetivo e profissional. Não invente informações.`

export class AIService {
  async analyzeMessage(
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    userMessage: string
  ): Promise<AnalysisResult> {
    try {
      // Prepara o histórico de mensagens
      const messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user' as const, content: userMessage },
      ]

      // Chama a API do Groq
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile', // Modelo gratuito e rápido do Groq
        messages,
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      })

      const responseContent = completion.choices[0]?.message?.content

      if (!responseContent) {
        throw new Error('Resposta vazia da IA')
      }

      // Parse da resposta JSON
      const analysis: AnalysisResult = JSON.parse(responseContent)

      // Validação básica
      if (!analysis.message) {
        throw new Error('Resposta da IA não contém mensagem')
      }

      return analysis
    } catch (error) {
      console.error('Erro ao analisar mensagem com IA:', error)

      // Fallback em caso de erro
      return {
        shouldTransfer: false,
        department: null,
        message:
          'Desculpe, estou com dificuldades técnicas no momento. Por favor, reformule sua mensagem ou tente novamente em instantes.',
      }
    }
  }
}
