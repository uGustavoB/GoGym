"use client"

import { AlertCircle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChartErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ChartErrorState({
  message = "Não foi possível carregar os dados.",
  onRetry,
}: ChartErrorStateProps) {
  return (
    <div className="flex h-[300px] flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 text-center">
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertCircle className="size-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Erro ao carregar</p>
        <p className="max-w-[280px] text-xs text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          <RefreshCcw className="mr-2 size-3.5" />
          Tentar Novamente
        </Button>
      )}
    </div>
  )
}
