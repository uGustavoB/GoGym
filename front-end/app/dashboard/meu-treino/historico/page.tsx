"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { BarChart3, Search, Dumbbell, TrendingUp } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChartErrorState } from "@/components/shared/charts/chart-error-state"

import { buscarFichaAluno, type FichaTreino, type Exercicio } from "@/lib/services/treinos"

import type { Variants } from "framer-motion"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

interface ExercicioUnico {
  id: number
  nome: string
  grupo_muscular: string
  tipo: string
}

export default function HistoricoExerciciosPage() {
  const [ficha, setFicha] = useState<FichaTreino | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busca, setBusca] = useState("")

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(null)
    buscarFichaAluno()
      .then((res) => setFicha(res.data))
      .catch((err) => setError(err.message || "Erro ao carregar sua ficha de treino."))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Extract unique exercises from all routines
  const exercicios = useMemo<ExercicioUnico[]>(() => {
    if (!ficha?.rotinas) return []

    const map = new Map<number, ExercicioUnico>()

    ficha.rotinas.forEach((rotina) => {
      rotina.exercicios.forEach((re) => {
        if (re.exercicio && !map.has(re.exercicio.id)) {
          map.set(re.exercicio.id, {
            id: re.exercicio.id,
            nome: re.exercicio.nome,
            grupo_muscular: re.exercicio.grupo_muscular,
            tipo: re.exercicio.tipo,
          })
        }
      })
    })

    return Array.from(map.values()).sort((a, b) => a.nome.localeCompare(b.nome))
  }, [ficha])

  const exerciciosFiltrados = useMemo(() => {
    if (!busca.trim()) return exercicios
    const term = busca.toLowerCase()
    return exercicios.filter(
      (e) =>
        e.nome.toLowerCase().includes(term) ||
        e.grupo_muscular.toLowerCase().includes(term)
    )
  }, [exercicios, busca])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Meu Progresso</h1>
          </div>
          <p className="text-muted-foreground">
            Selecione um exercício para visualizar seu histórico de evolução.
          </p>
        </div>
      </motion.div>

      {/* Error */}
      {error && !loading && (
        <ChartErrorState message={error} onRetry={fetchData} />
      )}

      {/* Content */}
      {!error && (
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Exercícios da Ficha Atual</CardTitle>
              <CardDescription>
                Clique em um exercício para ver sua progressão de carga e volume
              </CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar exercício..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : exercicios.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <div className="rounded-full bg-muted p-3">
                    <Dumbbell className="size-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Nenhum exercício encontrado</p>
                    <p className="max-w-[280px] text-xs text-muted-foreground">
                      Você ainda não possui uma ficha de treino ativa com exercícios.
                    </p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-[450px]">
                  <div className="space-y-2 pr-3">
                    {exerciciosFiltrados.length === 0 ? (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        Nenhum exercício encontrado para &quot;{busca}&quot;.
                      </p>
                    ) : (
                      exerciciosFiltrados.map((exercicio) => (
                        <Link
                          key={exercicio.id}
                          href={`/dashboard/meu-treino/historico/${exercicio.id}`}
                          className="group flex items-center justify-between rounded-lg border border-border px-4 py-3 transition-all hover:border-primary/30 hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                              <Dumbbell className="size-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium group-hover:text-primary transition-colors">
                                {exercicio.nome}
                              </p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {exercicio.grupo_muscular}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="hidden sm:inline-flex capitalize">
                              {exercicio.tipo.replace("_", " ")}
                            </Badge>
                            <TrendingUp className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
