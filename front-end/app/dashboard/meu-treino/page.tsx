"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Dumbbell,
  Loader2,
  CheckCircle2,
  Clock,
  Target,
  Trophy,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import {
  buscarFichaAluno,
  registrarExecucaoSessao,
  type FichaTreino,
  type RotinaSessao,
  type RotinaExercicio,
  type RegistrarSessaoPayload,
} from "@/lib/services/treinos"
import type { Variants } from "framer-motion"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
}

interface SerieInput {
  rotina_exercicio_id: number
  numero_serie: number
  repeticoes_realizadas: string
  carga_realizada: string
}

export default function MeuTreinoPage() {
  const { tipoPerfil } = useAuth()
  const [ficha, setFicha] = useState<FichaTreino | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Estado da sessão em execução
  const [rotinaAtiva, setRotinaAtiva] = useState<string>("")
  const [seriesInputs, setSeriesInputs] = useState<Record<string, SerieInput>>({})
  const [pse, setPse] = useState<string>("")
  const [duracaoMinutos, setDuracaoMinutos] = useState<string>("")
  const [observacoes, setObservacoes] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [concluido, setConcluido] = useState(false)

  useEffect(() => {
    buscarFichaAluno()
      .then((res) => {
        setFicha(res.data)
        if (res.data.rotinas.length > 0) {
          setRotinaAtiva(res.data.rotinas[0].letra_nome)
        }
      })
      .catch(() => {
        setError(true)
      })
      .finally(() => setLoading(false))
  }, [])

  // Rotina selecionada
  const rotinaSelecionada = useMemo(() => {
    if (!ficha) return null
    return ficha.rotinas.find((r) => r.letra_nome === rotinaAtiva) || null
  }, [ficha, rotinaAtiva])

  // Inicializa inputs quando rotina muda
  useEffect(() => {
    if (!rotinaSelecionada) return
    const inputs: Record<string, SerieInput> = {}
    rotinaSelecionada.exercicios.forEach((ex) => {
      for (let s = 1; s <= ex.series; s++) {
        const key = `${ex.id}-${s}`
        if (!seriesInputs[key]) {
          inputs[key] = {
            rotina_exercicio_id: ex.id,
            numero_serie: s,
            repeticoes_realizadas: ex.repeticoes || "",
            carga_realizada: ex.carga_sugerida || "",
          }
        } else {
          inputs[key] = seriesInputs[key]
        }
      }
    })
    setSeriesInputs((prev) => ({ ...prev, ...inputs }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotinaSelecionada])

  const updateSerieInput = (
    key: string,
    field: "repeticoes_realizadas" | "carga_realizada",
    value: string
  ) => {
    setSeriesInputs((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }))
  }

  const handleFinalizar = async () => {
    if (!rotinaSelecionada || !ficha) return

    // Validação básica
    if (!pse || Number(pse) < 1 || Number(pse) > 10) {
      toast.error("Informe o PSE (Percepção Subjetiva de Esforço) de 1 a 10.")
      return
    }
    if (!duracaoMinutos || Number(duracaoMinutos) < 1) {
      toast.error("Informe a duração do treino em minutos.")
      return
    }

    // Montar séries da rotina ativa
    const seriesPayload = Object.values(seriesInputs)
      .filter((s) =>
        rotinaSelecionada.exercicios.some((ex) => ex.id === s.rotina_exercicio_id)
      )
      .map((s) => ({
        rotina_exercicio_id: s.rotina_exercicio_id,
        numero_serie: s.numero_serie,
        repeticoes_realizadas: Number(s.repeticoes_realizadas) || 0,
        carga_realizada: s.carga_realizada || "0",
      }))

    if (seriesPayload.length === 0) {
      toast.error("Preencha ao menos uma série.")
      return
    }

    const payload: RegistrarSessaoPayload = {
      rotina_sessao_id: rotinaSelecionada.id,
      data_execucao: new Date().toISOString().split("T")[0],
      esforco_percebido: Number(pse),
      duracao_minutos: Number(duracaoMinutos),
      observacoes_aluno: observacoes || undefined,
      series: seriesPayload,
    }

    setSubmitting(true)
    try {
      await registrarExecucaoSessao(payload)
      toast.success("Treino registado com sucesso! 💪")
      setConcluido(true)
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Erro ao registar sessão de treino."
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  // Guard: apenas aluno
  if (tipoPerfil === "personal") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Dumbbell className="size-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-medium">Área do Aluno</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Esta página é exclusiva para alunos visualizarem e registarem seus
          treinos.
        </p>
      </div>
    )
  }

  // Loading
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-16" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  // Sem ficha
  if (error || !ficha) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Dumbbell className="size-7 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-medium">Nenhum treino encontrado</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          O seu Personal Trainer ainda não montou uma ficha de treino para você.
          Entre em contacto com ele!
        </p>
      </div>
    )
  }

  // Tela de sucesso
  if (concluido) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Trophy className="size-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Treino Concluído! 🎉</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          Parabéns! A sua sessão de treino foi registada com sucesso. Continue
          assim!
        </p>
        <Button
          className="mt-6"
          onClick={() => {
            setConcluido(false)
            setPse("")
            setDuracaoMinutos("")
            setObservacoes("")
          }}
        >
          Registar Outro Treino
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Meu Treino</h1>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">{ficha.nome}</span>
            {ficha.objetivo && (
              <span> — {ficha.objetivo}</span>
            )}
          </p>
        </div>
      </motion.div>

      {/* Rotina Selector */}
      <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
        <div className="flex flex-wrap gap-2">
          {ficha.rotinas.map((rotina) => (
            <Button
              key={rotina.id}
              variant={rotinaAtiva === rotina.letra_nome ? "default" : "outline"}
              size="sm"
              onClick={() => setRotinaAtiva(rotina.letra_nome)}
              className="min-w-[3rem]"
            >
              Treino {rotina.letra_nome}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Exercícios da Rotina */}
      {rotinaSelecionada && (
        <div className="grid gap-4 md:grid-cols-2">
          {rotinaSelecionada.exercicios.map((ex, exIdx) => (
            <motion.div
              key={ex.id}
              initial="hidden"
              animate="visible"
              custom={exIdx + 2}
              variants={fadeUp}
            >
              <Card className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <CardTitle className="text-base">
                        {ex.exercicio?.nome || `Exercício #${ex.ordem}`}
                      </CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-1.5">
                        {ex.exercicio?.grupo_muscular && (
                          <Badge
                            variant="secondary"
                            className="text-xs capitalize"
                          >
                            {ex.exercicio.grupo_muscular.replace("_", " ")}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {ex.series} x {ex.repeticoes || "?"}
                        </Badge>
                        {ex.rir !== null && ex.rir !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            RIR {ex.rir}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-sm font-bold">
                      {ex.ordem}
                    </div>
                  </div>
                  {ex.carga_sugerida && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Carga sugerida: <strong>{ex.carga_sugerida}</strong>
                    </p>
                  )}
                  {ex.observacoes && (
                    <p className="text-xs text-muted-foreground italic">
                      {ex.observacoes}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.from({ length: ex.series }).map((_, sIdx) => {
                      const key = `${ex.id}-${sIdx + 1}`
                      const serie = seriesInputs[key]
                      if (!serie) return null
                      return (
                        <div
                          key={key}
                          className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2"
                        >
                          <span className="w-16 shrink-0 text-xs font-medium text-muted-foreground">
                            Série {sIdx + 1}
                          </span>
                          <div className="flex flex-1 items-center gap-2">
                            <div className="flex-1 space-y-0.5">
                              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                Reps
                              </Label>
                              <Input
                                type="number"
                                min={0}
                                className="h-8 text-center"
                                value={serie.repeticoes_realizadas}
                                onChange={(e) =>
                                  updateSerieInput(
                                    key,
                                    "repeticoes_realizadas",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                Carga
                              </Label>
                              <Input
                                className="h-8 text-center"
                                placeholder="Ex: 20kg"
                                value={serie.carga_realizada}
                                onChange={(e) =>
                                  updateSerieInput(
                                    key,
                                    "carga_realizada",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary/40 to-primary/10" />
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Finalizar Sessão */}
      {rotinaSelecionada && (
        <motion.div initial="hidden" animate="visible" custom={10} variants={fadeUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="size-4" />
                Finalizar Sessão
              </CardTitle>
              <CardDescription>
                Informe os dados finais para registar o seu treino.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                {/* PSE */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Target className="size-3.5" />
                    PSE (1-10) *
                  </Label>
                  <Select value={pse} onValueChange={setPse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Esforço percebido" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(
                        (val) => (
                          <SelectItem key={val} value={val.toString()}>
                            {val} —{" "}
                            {val <= 3
                              ? "Leve"
                              : val <= 5
                                ? "Moderado"
                                : val <= 7
                                  ? "Difícil"
                                  : val <= 9
                                    ? "Muito Difícil"
                                    : "Máximo"}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Duração */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    Duração (min) *
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="55"
                    value={duracaoMinutos}
                    onChange={(e) => setDuracaoMinutos(e.target.value)}
                  />
                </div>

                {/* Observações */}
                <div className="space-y-1.5 sm:col-span-1">
                  <Label>Observações</Label>
                  <Input
                    placeholder="Notas sobre o treino..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  size="lg"
                  disabled={submitting}
                  onClick={handleFinalizar}
                >
                  {submitting ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 size-4" />
                  )}
                  Finalizar Treino
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
