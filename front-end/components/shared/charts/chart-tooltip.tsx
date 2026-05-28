"use client"

import type { Payload } from "recharts/types/component/DefaultTooltipContent"
import type { ReactNode } from "react"

interface ChartTooltipEntry {
  label: string
  value: string | number
  color?: string
}

interface ChartTooltipProps {
  active?: boolean
  payload?: Payload<number, string>[]
  label?: ReactNode
  formatEntries?: (payload: Payload<number, string>[]) => ChartTooltipEntry[]
  labelFormatter?: (label: string) => string
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatEntries,
  labelFormatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  const entries: ChartTooltipEntry[] = formatEntries
    ? formatEntries(payload)
    : payload.map((entry: Payload<number, string>) => ({
        label: String(entry.name ?? ""),
        value: entry.value ?? 0,
        color: entry.color,
      }))

  const formattedLabel = labelFormatter ? labelFormatter(String(label)) : String(label)

  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{formattedLabel}</p>
      <div className="space-y-1">
        {entries.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {entry.color && (
                <span
                  className="inline-block size-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
              )}
              <span className="text-xs text-muted-foreground">{entry.label}</span>
            </div>
            <span className="text-xs font-semibold tabular-nums text-foreground">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
