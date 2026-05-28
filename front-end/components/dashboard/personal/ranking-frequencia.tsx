"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { RankingAluno } from "@/lib/services/dashboard"
import Link from "next/link"

function getInitials(nome: string) {
  return nome
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

interface RankingItemProps {
  aluno: RankingAluno
  rank: number
  variant: "top" | "bottom"
}

function RankingItem({ aluno, rank, variant }: RankingItemProps) {
  return (
    <Link
      href={`/dashboard/alunos/${aluno.aluno_id}/progresso`}
      className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60"
    >
      <span className="flex size-5 items-center justify-center text-xs font-medium text-muted-foreground">
        {rank}
      </span>
      <Avatar className="size-8">
        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
          {getInitials(aluno.nome)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 truncate">
        <p className="truncate text-sm font-medium">{aluno.nome}</p>
      </div>
      <Badge variant={variant === "top" ? "default" : "secondary"} className="tabular-nums">
        {aluno.sessoes} {aluno.sessoes === 1 ? "sessão" : "sessões"}
      </Badge>
    </Link>
  )
}

function RankingSkeleton() {
  return (
    <div className="space-y-3 px-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <Skeleton className="size-5 rounded" />
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

interface RankingFrequenciaProps {
  topFrequentes: RankingAluno[]
  menosFrequentes: RankingAluno[]
  loading?: boolean
}

export function RankingFrequencia({
  topFrequentes,
  menosFrequentes,
  loading = false,
}: RankingFrequenciaProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            <CardTitle className="text-sm font-medium">Mais Frequentes</CardTitle>
          </div>
          <CardDescription>Alunos com mais sessões nos últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <RankingSkeleton />
          ) : topFrequentes.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Nenhum dado de frequência disponível.
            </p>
          ) : (
            <ScrollArea className="h-[180px]">
              <div className="space-y-0.5">
                {topFrequentes.map((aluno, i) => (
                  <RankingItem key={aluno.aluno_id} aluno={aluno} rank={i + 1} variant="top" />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="size-4 text-destructive" />
            <CardTitle className="text-sm font-medium">Menos Frequentes</CardTitle>
          </div>
          <CardDescription>Alunos que precisam de acompanhamento</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <RankingSkeleton />
          ) : menosFrequentes.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Nenhum dado de frequência disponível.
            </p>
          ) : (
            <ScrollArea className="h-[180px]">
              <div className="space-y-0.5">
                {menosFrequentes.map((aluno, i) => (
                  <RankingItem
                    key={aluno.aluno_id}
                    aluno={aluno}
                    rank={i + 1}
                    variant="bottom"
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
