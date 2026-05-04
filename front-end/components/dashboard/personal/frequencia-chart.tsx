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
import type { FrequenciaSemanal } from "@/lib/services/dashboard"
import { CalendarDays } from "lucide-react"

interface FrequenciaChartProps {
  data: FrequenciaSemanal[]
  loading?: boolean
}

export function FrequenciaChart({ data, loading = false }: FrequenciaChartProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-chart-2" />
          <CardTitle className="text-sm font-medium">Frequência Semanal</CardTitle>
        </div>
        <CardDescription>
          Número de sessões realizadas e duração média por semana
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full rounded-xl" />
        ) : data.length === 0 ? (
          <ChartEmptyState
            title="Sem dados de frequência"
            description="A frequência semanal aparecerá aqui após sessões registradas."
          />
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
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
                  width={30}
                  allowDecimals={false}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      labelFormatter={(label) => `Semana ${label}`}
                      formatEntries={(payload) =>
                        payload?.map((e) => {
                          const entry = e.payload as unknown as FrequenciaSemanal
                          if (String(e.dataKey) === "sessoes") {
                            return {
                              label: "Sessões",
                              value: `${e.value}`,
                              color: "var(--color-chart-2)",
                            }
                          }
                          return {
                            label: "Duração média",
                            value: `${entry.duracao_media} min`,
                            color: "var(--color-chart-2)",
                          }
                        }) ?? []
                      }
                    />
                  }
                />
                <Bar
                  dataKey="sessoes"
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
