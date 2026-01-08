import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from '@/components/chat-message'
import { TransferCard } from '@/components/transfer-card'
import { apiService } from '@/services/api'
import type { Message, Conversation } from '@/types/message'
import { Send, Loader2, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto scroll para a última mensagem
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        }, 100)
      }
    }
  }, [messages, isLoading, conversation?.status])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim() || isLoading) return

    const messageContent = inputValue.trim()
    setInputValue('')
    setError(null)
    setIsLoading(true)

    try {
      const updatedConversation = await apiService.sendMessage({
        conversationId: conversation?.id,
        content: messageContent,
      })

      setConversation(updatedConversation)
      setMessages(updatedConversation.messages)
    } catch (err) {
      setError('Erro ao enviar mensagem. Tente novamente.')
      console.error('Erro:', err)
      // Restaurar a mensagem em caso de erro
      setInputValue(messageContent)
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleNewConversation = () => {
    setMessages([])
    setConversation(null)
    setError(null)
    setInputValue('')
    inputRef.current?.focus()
  }

  const isTransferred = conversation?.status === 'TRANSFERRED'

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Agente de Triagem
              </h1>
              <p className="text-sm text-muted-foreground">
                Atendimento inteligente
              </p>
            </div>
          </div>

          {conversation && (
            <Button
              variant="outline"
              onClick={handleNewConversation}
              className="hidden sm:flex cursor-pointer bg-[hsl(var(--chat-user-bg))] text-white"
            >
              Nova Conversa
            </Button>
          )}
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 container mx-auto px-4 py-4 flex flex-col max-w-5xl min-h-0">
        <Card className="flex-1 flex flex-col shadow-lg min-h-0">
          <ScrollArea ref={scrollAreaRef} className="flex-1 px-2 min-h-0">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 px-4">
                <div className="h-20 w-20 rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6">
                  <MessageSquare className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Bem-vindo!
                </h2>
                <p className="text-muted-foreground text-center max-w-md">
                  Olá! Sou seu assistente virtual. Como posso ajudá-lo hoje?
                  Estou aqui para questões sobre vendas, suporte ou financeiro.
                </p>
              </div>
            ) : (
              <div className="py-4 space-y-0">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    department={conversation?.department}
                  />
                ))}

                {isTransferred && conversation?.department && (
                  <TransferCard
                    department={conversation.department}
                    summary={conversation.summary}
                  />
                )}

                {isLoading && (
                  <div className="flex gap-3 px-4 py-6">
                    <div className="h-9 w-9 rounded-full bg-primary/5 flex items-center justify-center border-2 border-primary/10">
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-md bg-muted">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]" />
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]" />
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t bg-card/50 p-4 shrink-0">
            {error && (
              <div className="mb-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            {isTransferred && (
              <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-900 dark:text-amber-100 font-medium">
                  ✓ Conversa encerrada - Você foi transferido para o setor de{' '}
                  {conversation.department === 'SALES' && 'Vendas'}
                  {conversation.department === 'SUPPORT' && 'Suporte'}
                  {conversation.department === 'FINANCE' && 'Financeiro'}
                </p>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  isTransferred
                    ? 'Esta conversa foi encerrada'
                    : 'Digite sua mensagem...'
                }
                disabled={isLoading || isTransferred}
                className={cn(
                  'flex-1 bg-background border-input focus-visible:ring-primary',
                  'disabled:opacity-50'
                )}
                maxLength={2000}
              />
              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim() || isTransferred}
                size="icon"
                className="shrink-0 h-10 w-10"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>

            {!isTransferred && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {inputValue.length}/2000 caracteres
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
