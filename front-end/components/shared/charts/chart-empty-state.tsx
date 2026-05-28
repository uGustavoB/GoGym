"use client"

import { BarChart3 } from "lucide-react"

interface ChartEmptyStateProps {
  title?: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
}

export function ChartEmptyState({
  title = "Sem dados disponíveis",
  description = "Inicie seu primeiro treino para ver seu progresso aqui.",
  icon: Icon = BarChart3,
}: ChartEmptyStateProps) {
  return (
    <div className="flex h-[300px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 text-center">
      <div className="rounded-full bg-muted p-3">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="max-w-[280px] text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
