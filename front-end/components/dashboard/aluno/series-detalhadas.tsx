"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronUp, ListChecks } from "lucide-react"
import { cn } from "@/lib/utils"
import type { HistoricoRegistro } from "@/lib/services/dashboard"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface SeriesDetalhadasProps {
  data: HistoricoRegistro[]
  loading?: boolean
}

function SessaoRow({ registro }: { registro: HistoricoRegistro }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-lg border border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">
            {format(parseISO(registro.data), "dd 'de' MMMM", { locale: ptBR })}
          </span>
          <Badge variant="secondary" className="tabular-nums text-xs">
            {registro.series.length} {registro.series.length === 1 ? "série" : "séries"}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-xs text-muted-foreground">Máx:</span>
            <span className="text-xs font-semibold tabular-nums">{registro.carga_maxima} kg</span>
          </div>
          {expanded ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </div>
      </button>
      <div
        className={cn(
          "grid transition-all duration-200",
          expanded ? "grid-rows-[1fr] border-t border-border" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-3 py-2">
            <div className="grid grid-cols-3 gap-2 border-b border-border pb-1.5 text-xs font-medium text-muted-foreground">
              <span>Série</span>
              <span className="text-center">Reps</span>
              <span className="text-right">Carga</span>
            </div>
            {registro.series.map((serie) => (
              <div
                key={serie.numero_serie}
                className="grid grid-cols-3 gap-2 border-b border-border/50 py-1.5 text-sm last:border-0"
              >
                <span className="tabular-nums text-muted-foreground">
                  {serie.numero_serie}ª
                </span>
                <span className="text-center tabular-nums">{serie.repeticoes}</span>
                <span className="text-right tabular-nums font-medium">{serie.carga} kg</span>
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-xs">
              <span className="text-muted-foreground">Volume total</span>
              <span className="font-semibold tabular-nums">
                {registro.volume_sessao.toLocaleString("pt-BR")} kg
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SeriesDetalhadas({ data, loading = false }: SeriesDetalhadasProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ListChecks className="size-4 text-chart-3" />
          <CardTitle className="text-sm font-medium">Séries Detalhadas</CardTitle>
        </div>
        <CardDescription>
          Clique em uma sessão para ver todas as séries realizadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            Nenhuma sessão registrada para este exercício.
          </p>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 pr-3">
              {[...data].reverse().map((registro) => (
                <SessaoRow key={registro.data} registro={registro} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
