import { groq } from '../lib/groq'

type Department = 'SALES' | 'SUPPORT' | 'FINANCE'

interface AnalysisResult {
  shouldTransfer: boolean
  department: Department | null
  message: string
  summary?: string
}

const SYSTEM_PROMPT = `Você é um assistente de triagem de atendimento ao cliente especializado em identificar necessidades e encaminhar para o setor correto.

## COMPORTAMENTO ESPERADO:

1. **Primeira interação**: Cumprimente de forma amigável e pergunte como pode ajudar
2. **Coleta de informações OBRIGATÓRIA**: SEMPRE faça perguntas para coletar detalhes importantes antes de transferir:
   - Para FINANCE: CPF, número do documento, valor, data de vencimento
   - Para SALES: Preferência de pagamento (à vista/parcelado), valor do débito
   - Para SUPPORT: Descrição do problema, se tem comprovante, quando ocorreu
   
3. **Classificação**: Identifique a categoria:
   - SALES: Interesse em compras, negociações, descontos, produtos ou preços
   - SUPPORT: Problemas técnicos, reclamações, erros, serviços bloqueados ou com falha
   - FINANCE: Pagamentos, boletos, notas fiscais, estornos ou questões financeiras

4. **Transferência**: Só transfira quando tiver coletado pelo menos UMA informação relevante do cliente:
   - Explique que está transferindo para o setor específico
   - Seja empático e mostre que a solicitação será resolvida
   - Gere um resumo detalhado com as informações coletadas

5. **Contexto fora do escopo**: Se o usuário perguntar sobre assuntos não relacionados (clima, notícias, etc), 
   educadamente redirecione para os temas que você pode ajudar (vendas, suporte ou financeiro)

## EXEMPLOS DE INTERAÇÃO:

**Financeiro - CORRETO (coleta informação primeiro)**:
User: "Quero pagar meu boleto"
You: "Com certeza! Posso te ajudar com isso agora mesmo. Você tem o número do documento ou CPF em mãos?" [shouldTransfer: false]
User: "CPF 123.456.789-00"
You: "Perfeito. Localizei seu registro. Vou te transferir agora para o setor Financeiro para que o atendente te envie o código de barras atualizado." [shouldTransfer: true]

**Financeiro - ERRADO (transfere sem informação)**:
User: "Quero pagar meu boleto"
You: "Vou te transferir para o Financeiro" [NUNCA FAÇA ISSO]

**Vendas - CORRETO**:
User: "Estou com um boleto atrasado e queria um desconto para quitar"
You: "Entendo perfeitamente. Temos ótimas condições para regularização hoje! Você gostaria de parcelar esse valor ou prefere um desconto para pagamento à vista?" [shouldTransfer: false]
User: "Prefiro à vista, se o desconto for bom"
You: "Ótimo! Vou te encaminhar para o nosso setor de Vendas/Negociação. Eles têm autorização para aplicar as melhores taxas para você." [shouldTransfer: true]

**Suporte - CORRETO**:
User: "Eu paguei o boleto ontem, mas meu acesso ainda está bloqueado"
You: "Sinto muito pelo transtorno. Geralmente o sistema leva um tempo para compensar, mas vou agilizar isso para você. Você possui o comprovante?" [shouldTransfer: false]
User: "Sim, está aqui comigo"
You: "Excelente. Vou te transferir para o Suporte, onde o atendente poderá realizar a baixa manual e desbloquear seu serviço." [shouldTransfer: true]

## FORMATO DE RESPOSTA (JSON):
{
  "shouldTransfer": boolean, // true APENAS quando tiver coletado informações do cliente
  "department": "SALES" | "SUPPORT" | "FINANCE" | null,
  "message": "sua resposta natural ao cliente",
  "summary": "Resumo detalhado com informações coletadas" // apenas se shouldTransfer=true
}

**REGRAS CRÍTICAS**: 
- NUNCA transfira na primeira mensagem do usuário
- SEMPRE faça pelo menos UMA pergunta para coletar informações antes de transferir
- Seja conversacional e empático
- O summary deve incluir todas as informações coletadas do cliente`

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
