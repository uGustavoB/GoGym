"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  loading?: boolean
  gradientFrom?: string
  gradientTo?: string
  tooltip?: string
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  loading = false,
  gradientFrom = "from-primary/60",
  gradientTo = "to-primary",
  tooltip,
}: KpiCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-1.5">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-3.5 cursor-help text-muted-foreground/60" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px]">
                <p className="text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3.5 w-28" />
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold tabular-nums">{value}</div>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </>
        )}
      </CardContent>
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r",
          gradientFrom,
          gradientTo
        )}
      />
    </Card>
  )
}
