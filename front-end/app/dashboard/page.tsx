"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { motion } from "framer-motion"
import {
  Users,
  User,
  Dumbbell,
  Activity,
  Ruler,
  Weight,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  listarAlunosRequest,
  exibirAlunoRequest,
  type AlunoResource,
  type PaginatedResponse,
} from "@/lib/api"

import type { Variants } from "framer-motion"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

function PersonalDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<{ total: number; ativos: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listarAlunosRequest(1)
      .then((res: PaginatedResponse<AlunoResource>) => {
        const total = res.meta.total
        const ativos = res.data.filter((a) => a.status_conta === "Ativo").length
        setStats({ total, ativos })
      })
      .catch(() => setStats({ total: 0, ativos: 0 }))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <motion.div
        initial="hidden"
        animate="visible"
        custom={0}
        variants={fadeUp}
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Olá, {user?.nome.split(" ")[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            Aqui está o resumo do seu painel.
          </p>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Alunos
              </CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold">{stats?.total ?? 0}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                cadastrados na plataforma
              </p>
            </CardContent>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/60 to-primary" />
          </Card>
        </motion.div>

        <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Alunos Ativos
              </CardTitle>
              <Activity className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold text-primary">
                  {stats?.ativos ?? 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                atualmente vinculados
              </p>
            </CardContent>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-chart-2/60 to-chart-2" />
          </Card>
        </motion.div>

        <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ação Rápida
              </CardTitle>
              <Dumbbell className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button asChild size="sm" className="mt-1">
                <Link href="/dashboard/alunos">
                  Gerenciar Alunos
                  <ArrowRight className="ml-2 size-3.5" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                convites, listagem e ações
              </p>
            </CardContent>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-chart-3/60 to-chart-3" />
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

function AlunoDashboard() {
  const { user, perfilId } = useAuth()
  const [aluno, setAluno] = useState<AlunoResource | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!perfilId) {
      setLoading(false)
      return
    }
    exibirAlunoRequest(perfilId)
      .then((res) => setAluno(res.data))
      .catch(() => setAluno(null))
      .finally(() => setLoading(false))
  }, [perfilId])

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Olá, {user?.nome.split(" ")[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            Acompanhe seus dados e seu personal trainer.
          </p>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Peso Atual
              </CardTitle>
              <Weight className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold">
                  {aluno?.dados_fisicos?.peso
                    ? `${aluno.dados_fisicos.peso} kg`
                    : "—"}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                registrado no perfil
              </p>
            </CardContent>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/60 to-primary" />
          </Card>
        </motion.div>

        <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Altura
              </CardTitle>
              <Ruler className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold">
                  {aluno?.dados_fisicos?.altura
                    ? `${aluno.dados_fisicos.altura} m`
                    : "—"}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                registrada no perfil
              </p>
            </CardContent>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-chart-2/60 to-chart-2" />
          </Card>
        </motion.div>

        <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ação Rápida
              </CardTitle>
              <User className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button asChild size="sm" className="mt-1">
                <Link href="/dashboard/meu-personal">
                  Ver Meu Personal
                  <ArrowRight className="ml-2 size-3.5" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                informações do seu treinador
              </p>
            </CardContent>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-chart-3/60 to-chart-3" />
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { tipoPerfil } = useAuth()

  if (tipoPerfil === "personal") return <PersonalDashboard />
  return <AlunoDashboard />
}
