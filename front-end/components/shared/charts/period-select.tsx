"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Period } from "@/lib/services/dashboard"

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "3m", label: "Últimos 3 meses" },
  { value: "6m", label: "Últimos 6 meses" },
  { value: "1y", label: "Último ano" },
  { value: "all", label: "Todo o período" },
]

interface PeriodSelectProps {
  value: Period
  onValueChange: (value: Period) => void
}

export function PeriodSelect({ value, onValueChange }: PeriodSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as Period)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Período" />
      </SelectTrigger>
      <SelectContent>
        {PERIOD_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
