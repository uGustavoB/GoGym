"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { motion } from "framer-motion"
import {
  Users,
  Activity,
  Flame,
  CalendarDays,
  Timer,
  Zap,
  Trophy,
  Dumbbell,
} from "lucide-react"
import { KpiCard } from "@/components/shared/charts/kpi-card"
import { ChartErrorState } from "@/components/shared/charts/chart-error-state"
import { RankingFrequencia } from "@/components/dashboard/personal/ranking-frequencia"
import {
  buscarResumoPersonal,
  buscarResumoAluno,
  type PersonalResumo,
  type AlunoResumo,
} from "@/lib/services/dashboard"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

import type { Variants } from "framer-motion"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

// ── Personal Trainer Dashboard ──

function PersonalDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<PersonalResumo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(null)
    buscarResumoPersonal()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message || "Erro ao carregar dashboard."))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (error && !loading) {
    return (
      <div className="space-y-6">
        <Header nome={user?.nome} subtitulo="Aqui está o resumo do seu painel." />
        <ChartErrorState message={error} onRetry={fetchData} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Header nome={user?.nome} subtitulo="Aqui está o resumo do seu painel." />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
          <KpiCard
            title="Alunos Ativos"
            value={data?.total_alunos_ativos ?? 0}
            subtitle="vinculados atualmente"
            icon={Users}
            loading={loading}
            gradientFrom="from-primary/60"
            gradientTo="to-primary"
          />
        </motion.div>

        <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
          <KpiCard
            title="Adesão Semanal"
            value={data ? `${data.adesao_semanal.taxa_percentual}%` : "—"}
            subtitle={
              data
                ? `${data.adesao_semanal.sessoes_concluidas} de ${data.adesao_semanal.sessoes_planejadas} sessões`
                : undefined
            }
            icon={Activity}
            loading={loading}
            gradientFrom="from-chart-2/60"
            gradientTo="to-chart-2"
            tooltip="Taxa de sessões concluídas sobre o total planejado nesta semana"
          />
        </motion.div>

        <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
          <KpiCard
            title="Esforço Médio"
            value={data ? `${data.media_esforco_global}/10` : "—"}
            subtitle="RPE dos últimos 30 dias"
            icon={Flame}
            loading={loading}
            gradientFrom="from-chart-3/60"
            gradientTo="to-chart-3"
            tooltip="Média do esforço percebido (RPE) reportado pelos alunos nos últimos 30 dias"
          />
        </motion.div>

        <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
          <KpiCard
            title="Sessões da Semana"
            value={data?.adesao_semanal.sessoes_concluidas ?? 0}
            subtitle="concluídas nesta semana"
            icon={CalendarDays}
            loading={loading}
            gradientFrom="from-chart-4/60"
            gradientTo="to-chart-4"
          />
        </motion.div>
      </div>

      {/* Ranking de Frequência */}
      <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp}>
        <RankingFrequencia
          topFrequentes={data?.top_frequentes ?? []}
          menosFrequentes={data?.menos_frequentes ?? []}
          loading={loading}
        />
      </motion.div>
    </div>
  )
}

// ── Aluno Dashboard ──

function AlunoDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<AlunoResumo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(null)
    buscarResumoAluno()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message || "Erro ao carregar dashboard."))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (error && !loading) {
    return (
      <div className="space-y-6">
        <Header nome={user?.nome} subtitulo="Acompanhe seus dados e seu progresso." />
        <ChartErrorState message={error} onRetry={fetchData} />
      </div>
    )
  }

  const ultimaSessaoFormatada =
    data?.ultima_sessao
      ? format(parseISO(data.ultima_sessao), "dd 'de' MMMM", { locale: ptBR })
      : "Nenhuma"

  return (
    <div className="space-y-6">
      <Header nome={user?.nome} subtitulo="Acompanhe seus dados e seu progresso." />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
          <KpiCard
            title="Total de Sessões"
            value={data?.total_sessoes ?? 0}
            subtitle="treinos completos"
            icon={Dumbbell}
            loading={loading}
            gradientFrom="from-primary/60"
            gradientTo="to-primary"
          />
        </motion.div>

        <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
          <KpiCard
            title="Duração Média"
            value={data ? `${data.media_duracao_minutos} min` : "—"}
            subtitle="por sessão"
            icon={Timer}
            loading={loading}
            gradientFrom="from-chart-2/60"
            gradientTo="to-chart-2"
          />
        </motion.div>

        <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
          <KpiCard
            title="Esforço Médio"
            value={data ? `${data.media_esforco}/10` : "—"}
            subtitle="RPE autoavaliado"
            icon={Flame}
            loading={loading}
            gradientFrom="from-chart-3/60"
            gradientTo="to-chart-3"
            tooltip="Média do seu esforço percebido (RPE) em todas as sessões"
          />
        </motion.div>

        <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
          <KpiCard
            title="Sequência Atual"
            value={data ? `${data.sequencia_dias} dias` : "—"}
            subtitle={
              data ? `Melhor: ${data.melhor_sequencia} dias` : undefined
            }
            icon={Zap}
            loading={loading}
            gradientFrom="from-chart-4/60"
            gradientTo="to-chart-4"
            tooltip="Dias consecutivos com pelo menos uma sessão registrada"
          />
        </motion.div>
      </div>

      {/* Info Card */}
      <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp}>
        <div className="grid gap-4 sm:grid-cols-2">
          <KpiCard
            title="Última Sessão"
            value={ultimaSessaoFormatada}
            subtitle="data do último treino registrado"
            icon={CalendarDays}
            loading={loading}
            gradientFrom="from-chart-5/60"
            gradientTo="to-chart-5"
          />
          <KpiCard
            title="Melhor Sequência"
            value={data ? `${data.melhor_sequencia} dias` : "—"}
            subtitle="recorde pessoal de consistência"
            icon={Trophy}
            loading={loading}
            gradientFrom="from-primary/60"
            gradientTo="to-primary"
          />
        </div>
      </motion.div>
    </div>
  )
}

// ── Shared Components ──

function Header({ nome, subtitulo }: { nome?: string; subtitulo: string }) {
  return (
    <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Olá, {nome?.split(" ")[0]}! 👋
        </h1>
        <p className="text-muted-foreground">{subtitulo}</p>
      </div>
    </motion.div>
  )
}

// ── Page Router ──

export default function DashboardPage() {
  const { tipoPerfil } = useAuth()

  if (tipoPerfil === "personal") return <PersonalDashboard />
  return <AlunoDashboard />
}
