"use client"

import { useState, useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip } from "@/components/shared/charts/chart-tooltip"
import { ChartEmptyState } from "@/components/shared/charts/chart-empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import type { CargaMaximaExercicio } from "@/lib/services/dashboard"
import { Dumbbell } from "lucide-react"

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

interface CargaMaximaChartProps {
  data: CargaMaximaExercicio[]
  loading?: boolean
}

export function CargaMaximaChart({ data, loading = false }: CargaMaximaChartProps) {
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set())

  // Transform data: pivot exercises into rows by semana
  const chartData = useMemo(() => {
    if (!data.length) return []

    const semanaMap = new Map<string, Record<string, number>>()

    data.forEach((ex) => {
      ex.evolucao.forEach((ev) => {
        const existing = semanaMap.get(ev.semana) ?? {}
        existing[ex.exercicio_nome] = ev.carga_maxima
        semanaMap.set(ev.semana, existing)
      })
    })

    return Array.from(semanaMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([semana, values]) => ({ semana, ...values }))
  }, [data])

  const handleLegendClick = (entry: { value?: string }) => {
    if (!entry.value) return
    setHiddenLines((prev) => {
      const next = new Set(prev)
      if (next.has(entry.value!)) {
        next.delete(entry.value!)
      } else {
        next.add(entry.value!)
      }
      return next
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Dumbbell className="size-4 text-chart-4" />
          <CardTitle className="text-sm font-medium">Evolução de Carga Máxima</CardTitle>
        </div>
        <CardDescription>
          Carga máxima por exercício ao longo do tempo — clique na legenda para filtrar
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[350px] w-full rounded-xl" />
        ) : data.length === 0 ? (
          <ChartEmptyState
            title="Sem dados de carga"
            description="A evolução de carga aparecerá aqui após treinos registrados."
          />
        ) : (
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                <XAxis
                  dataKey="semana"
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
                      labelFormatter={(label) => `Semana ${label}`}
                      formatEntries={(payload) =>
                        payload
                          ?.filter((e: { name?: string }) => !hiddenLines.has(String(e.name)))
                          .map((e: { name?: string; value?: number | string; color?: string }) => ({
                            label: String(e.name),
                            value: `${e.value} kg`,
                            color: e.color,
                          })) ?? []
                      }
                    />
                  }
                />
                <Legend
                  onClick={handleLegendClick}
                  wrapperStyle={{ cursor: "pointer", fontSize: 12 }}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span
                      className="text-xs"
                      style={{
                        opacity: hiddenLines.has(value) ? 0.3 : 1,
                      }}
                    >
                      {value}
                    </span>
                  )}
                />
                {data.map((ex, i) => (
                  <Line
                    key={ex.exercicio_id}
                    type="monotone"
                    dataKey={ex.exercicio_nome}
                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={chartData.length === 1 ? { r: 4 } : { r: 2 }}
                    activeDot={{ r: 5, strokeWidth: 2 }}
                    hide={hiddenLines.has(ex.exercicio_nome)}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
