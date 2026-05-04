"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip } from "@/components/shared/charts/chart-tooltip"
import { ChartEmptyState } from "@/components/shared/charts/chart-empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import type { EsforcoPorSessao } from "@/lib/services/dashboard"
import { Activity } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface EsforcoSessaoChartProps {
  data: EsforcoPorSessao[]
  loading?: boolean
}

export function EsforcoSessaoChart({ data, loading = false }: EsforcoSessaoChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    dataFormatada: format(parseISO(d.data), "dd/MM", { locale: ptBR }),
  }))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-chart-3" />
          <CardTitle className="text-sm font-medium">Esforço Percebido (RPE)</CardTitle>
        </div>
        <CardDescription>
          Escala de 0 a 10 — autoavaliação do aluno por sessão
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full rounded-xl" />
        ) : data.length === 0 ? (
          <ChartEmptyState
            title="Sem dados de esforço"
            description="O esforço percebido aparecerá aqui após sessões registradas."
          />
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={formattedData}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                <XAxis
                  dataKey="dataFormatada"
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 10]}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      formatEntries={(payload) =>
                        payload?.map((e) => ({
                          label: e.name === "esforco_percebido" ? "RPE" : "Duração",
                          value:
                            e.name === "esforco_percebido"
                              ? `${e.value}/10`
                              : `${(e.payload as unknown as EsforcoPorSessao)?.duracao_minutos ?? 0} min`,
                          color: e.color,
                        })) ?? []
                      }
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="esforco_percebido"
                  stroke="var(--color-chart-3)"
                  strokeWidth={2}
                  dot={data.length === 1 ? { r: 4 } : { r: 2.5 }}
                  activeDot={{ r: 5, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
