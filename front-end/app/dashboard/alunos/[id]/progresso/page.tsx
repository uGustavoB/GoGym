"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { PeriodSelect } from "@/components/shared/charts/period-select"
import { ChartErrorState } from "@/components/shared/charts/chart-error-state"

import { VolumeLoadChart } from "@/components/dashboard/personal/volume-load-chart"
import { EsforcoSessaoChart } from "@/components/dashboard/personal/esforco-sessao-chart"
import { FrequenciaChart } from "@/components/dashboard/personal/frequencia-chart"
import { CargaMaximaChart } from "@/components/dashboard/personal/carga-maxima-chart"

import {
  buscarProgressoAluno,
  type ProgressoAluno,
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

export default function ProgressoAlunoPage() {
  const params = useParams()
  const alunoId = Number(params.id)

  const [data, setData] = useState<ProgressoAluno | null>(null)
  const [period, setPeriod] = useState<Period>("30d")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(null)
    buscarProgressoAluno(alunoId, period)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message || "Erro ao carregar progresso."))
      .finally(() => setLoading(false))
  }, [alunoId, period])

  useEffect(() => {
    if (alunoId) fetchData()
  }, [alunoId, fetchData])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Progresso do Aluno
              </h1>
              <p className="text-sm text-muted-foreground">
                Métricas de evolução e desempenho
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
        <Tabs defaultValue="visao-geral" className="space-y-4">
          <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
            <TabsList>
              <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
              <TabsTrigger value="evolucao-carga">Evolução de Carga</TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value="visao-geral" className="space-y-4">
            <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
              <VolumeLoadChart
                data={data?.volume_load_semanal ?? []}
                loading={loading}
              />
            </motion.div>

            <div className="grid gap-4 lg:grid-cols-2">
              <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
                <EsforcoSessaoChart
                  data={data?.esforco_por_sessao ?? []}
                  loading={loading}
                />
              </motion.div>
              <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
                <FrequenciaChart
                  data={data?.frequencia_semanal ?? []}
                  loading={loading}
                />
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="evolucao-carga" className="space-y-4">
            <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
              <CargaMaximaChart
                data={data?.carga_maxima_por_exercicio ?? []}
                loading={loading}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
