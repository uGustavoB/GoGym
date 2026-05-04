"use client"

import {
  BarChart,
  Bar,
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
import { BarChart3 } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface VolumeExercicioChartProps {
  data: HistoricoRegistro[]
  loading?: boolean
}

export function VolumeExercicioChart({ data, loading = false }: VolumeExercicioChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    dataFormatada: format(parseISO(d.data), "dd/MM", { locale: ptBR }),
  }))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-chart-2" />
          <CardTitle className="text-sm font-medium">Volume por Sessão</CardTitle>
        </div>
        <CardDescription>
          Soma de Carga × Repetições por sessão deste exercício
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full rounded-xl" />
        ) : data.length === 0 ? (
          <ChartEmptyState
            title="Sem dados de volume"
            description="O volume por sessão aparecerá aqui após treinos registrados."
          />
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
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
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  width={40}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      formatEntries={(payload) =>
                        payload?.map((e: { value?: number | string }) => ({
                          label: "Volume",
                          value: `${Number(e.value).toLocaleString("pt-BR")} kg`,
                          color: "var(--color-chart-2)",
                        })) ?? []
                      }
                    />
                  }
                />
                <Bar
                  dataKey="volume_sessao"
                  fill="var(--color-chart-2)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
