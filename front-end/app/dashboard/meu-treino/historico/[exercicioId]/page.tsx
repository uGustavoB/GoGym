"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { PeriodSelect } from "@/components/shared/charts/period-select"
import { ChartErrorState } from "@/components/shared/charts/chart-error-state"

import { HistoricoCargaChart } from "@/components/dashboard/aluno/historico-carga-chart"
import { VolumeExercicioChart } from "@/components/dashboard/aluno/volume-exercicio-chart"
import { SeriesDetalhadas } from "@/components/dashboard/aluno/series-detalhadas"

import {
  buscarHistoricoExercicio,
  type HistoricoExercicio,
  type Period,
} from "@/lib/services/dashboard"

import type { Variants } from "framer-motion"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function HistoricoExercicioPage() {
  const params = useParams()
  const exercicioId = Number(params.exercicioId)

  const [data, setData] = useState<HistoricoExercicio | null>(null)
  const [period, setPeriod] = useState<Period>("30d")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(null)
    buscarHistoricoExercicio(exercicioId, period)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message || "Erro ao carregar histórico."))
      .finally(() => setLoading(false))
  }, [exercicioId, period])

  useEffect(() => {
    if (exercicioId) fetchData()
  }, [exercicioId, fetchData])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/meu-treino">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                {data?.exercicio?.nome ?? "Histórico do Exercício"}
              </h1>
              <p className="text-sm text-muted-foreground">
                Evolução de carga e volume ao longo do tempo
              </p>
            </div>
          </div>
          <PeriodSelect value={period} onValueChange={setPeriod} />
        </div>
      </motion.div>

      {/* Error state */}
      {error && !loading && (
        <ChartErrorState message={error} onRetry={fetchData} />
      )}

      {/* Charts */}
      {!error && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
              <HistoricoCargaChart
                data={data?.historico ?? []}
                loading={loading}
              />
            </motion.div>
            <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
              <VolumeExercicioChart
                data={data?.historico ?? []}
                loading={loading}
              />
            </motion.div>
          </div>

          <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
            <SeriesDetalhadas
              data={data?.historico ?? []}
              loading={loading}
            />
          </motion.div>
        </>
      )}
    </div>
  )
}
