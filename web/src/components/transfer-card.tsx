import { Badge } from '@/components/ui/badge'
import { ArrowRight, FileText } from 'lucide-react'

interface TransferCardProps {
  department: 'SALES' | 'SUPPORT' | 'FINANCE'
  summary: string | null
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

export function TransferCard({ department, summary }: TransferCardProps) {
  const config = departmentConfig[department]

  return (
    <div className="px-4 py-6">
      <div className="mx-auto max-w-md border-2 rounded-lg shadow-sm bg-card">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <ArrowRight className="h-5 w-5 text-primary shrink-0" />
              <span className="font-semibold text-foreground text-sm">
                Transferindo para atendente
              </span>
            </div>
            <Badge
              variant="outline"
              style={{
                borderColor: config.color,
                backgroundColor: config.bgColor,
                color: config.color,
              }}
              className="font-semibold text-xs"
            >
              {config.label}
            </Badge>
          </div>

          {summary && (
            <div
              className="rounded-lg p-3 border"
              style={{
                backgroundColor: config.bgColor,
                borderColor: `${config.color}20`,
              }}
            >
              <div className="flex items-start gap-2 mb-2">
                <FileText
                  className="h-4 w-4 mt-0.5 shrink-0"
                  style={{ color: config.color }}
                />
                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: config.color }}
                >
                  Resumo para o Atendente
                </span>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {summary}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
