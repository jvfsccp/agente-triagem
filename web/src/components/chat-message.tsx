import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { Message } from '@/types/message'
import { Bot, User } from 'lucide-react'

interface ChatMessageProps {
  message: Message
  department?: 'SALES' | 'SUPPORT' | 'FINANCE' | null
}

const departmentConfig = {
  SALES: {
    label: 'Vendas',
    color: 'hsl(var(--sector-sales))',
    bgColor: 'hsl(var(--sector-sales) / 0.1)',
  },
  SUPPORT: {
    label: 'Suporte',
    color: 'hsl(var(--sector-support))',
    bgColor: 'hsl(var(--sector-support) / 0.1)',
  },
  FINANCE: {
    label: 'Financeiro',
    color: 'hsl(var(--sector-financial))',
    bgColor: 'hsl(var(--sector-financial) / 0.1)',
  },
}

export function ChatMessage({ message, department }: ChatMessageProps) {
  const isUser = message.role === 'USER'
  const isSystem = message.role === 'SYSTEM'

  if (isSystem) {
    return (
      <div className="flex justify-center py-4">
        <div className="max-w-md text-center">
          <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
            {message.content}
          </Badge>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-6 transition-colors',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <Avatar className="h-9 w-9 shrink-0 border-2 border-primary/10">
          <AvatarFallback className="bg-primary/5">
            <Bot className="h-5 w-5 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'flex flex-col gap-2 max-w-[75%] sm:max-w-[65%]',
          isUser && 'items-end'
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-4 py-3 shadow-sm',
            isUser
              ? 'bg-[hsl(var(--chat-user-bg))] text-[hsl(var(--chat-user-fg))] rounded-tr-md'
              : 'bg-[hsl(var(--chat-bot-bg))] text-[hsl(var(--chat-bot-fg))] border border-border rounded-tl-md'
          )}
        >
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap wrap-break-word">
            {message.content}
          </p>
        </div>

        <div className="flex items-center gap-2 px-2">
          <span className="text-xs text-muted-foreground">
            {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>

          {!isUser && department && departmentConfig[department] && (
            <Badge
              variant="outline"
              style={{
                borderColor: departmentConfig[department].color,
                backgroundColor: departmentConfig[department].bgColor,
                color: departmentConfig[department].color,
              }}
              className="text-xs font-semibold"
            >
              {departmentConfig[department].label}
            </Badge>
          )}
        </div>
      </div>

      {isUser && (
        <Avatar className="h-9 w-9 shrink-0 border-2 border-primary/10">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
