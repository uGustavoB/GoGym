"use client"

import {
  AreaChart,
  Area,
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
import type { HistoricoRegistro } from "@/lib/services/dashboard"
import { TrendingUp } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface HistoricoCargaChartProps {
  data: HistoricoRegistro[]
  loading?: boolean
}

export function HistoricoCargaChart({ data, loading = false }: HistoricoCargaChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    dataFormatada: format(parseISO(d.data), "dd/MM", { locale: ptBR }),
  }))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-chart-1" />
          <CardTitle className="text-sm font-medium">Evolução de Carga Máxima</CardTitle>
        </div>
        <CardDescription>
          Carga máxima atingida por sessão ao longo do tempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full rounded-xl" />
        ) : data.length === 0 ? (
          <ChartEmptyState
            title="Sem histórico de carga"
            description="Complete treinos com este exercício para ver sua evolução."
          />
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="cargaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                <XAxis
                  dataKey="dataFormatada"
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}kg`}
                  width={45}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      formatEntries={(payload) =>
                        payload?.map((e: { value?: number | string }) => ({
                          label: "Carga Máxima",
                          value: `${e.value} kg`,
                          color: "var(--color-chart-1)",
                        })) ?? []
                      }
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="carga_maxima"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  fill="url(#cargaGradient)"
                  dot={data.length === 1}
                  activeDot={{ r: 5, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
