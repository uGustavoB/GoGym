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
import type { VolumeLoadSemanal } from "@/lib/services/dashboard"
import { TrendingUp } from "lucide-react"

interface VolumeLoadChartProps {
  data: VolumeLoadSemanal[]
  loading?: boolean
}

export function VolumeLoadChart({ data, loading = false }: VolumeLoadChartProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-chart-1" />
          <CardTitle className="text-sm font-medium">Volume de Treino Semanal</CardTitle>
        </div>
        <CardDescription>
          Soma total de Carga (kg) × Repetições por semana
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full rounded-xl" />
        ) : data.length === 0 ? (
          <ChartEmptyState
            title="Sem dados de volume"
            description="Os treinos registrados aparecerão aqui como um gráfico de evolução."
          />
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
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
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  width={40}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      labelFormatter={(label) => `Semana ${label}`}
                      formatEntries={(payload) =>
                        payload?.map((e: { value?: number | string }) => ({
                          label: "Volume Load",
                          value: `${Number(e.value).toLocaleString("pt-BR")} kg`,
                          color: "var(--color-chart-1)",
                        })) ?? []
                      }
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="volume_load"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  fill="url(#volumeGradient)"
                  dot={data.length === 1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
