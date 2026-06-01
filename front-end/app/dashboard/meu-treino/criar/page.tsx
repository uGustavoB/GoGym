"use client"

import { useEffect, useState, useCallback } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Loader2, Plus, Trash2, ClipboardList, CalendarDays, Layers,
  Check, Copy, Calendar as CalendarIcon, Info, ArrowLeft,
  ChevronRight, ChevronLeft, CheckCircle2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { criarFicha, type CriarFichaPayload } from "@/lib/services/treinos"
import { ExercicioRotinaFields } from "@/components/treinos/exercicio-rotina-fields"
import type { Variants } from "framer-motion"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const STEPS = [
  { id: "dados-gerais", label: "Dados Gerais", icon: ClipboardList, description: "Nome e período" },
  { id: "periodizacao", label: "Periodização", icon: CalendarDays, description: "Fases e intensidades" },
  { id: "sessoes", label: "Sessões", icon: Layers, description: "Rotinas e exercícios" },
] as const

type StepId = (typeof STEPS)[number]["id"]

const exercicioSchema = z.object({
  exercicio_id: z.number().min(1, "Selecione um exercício"),
  ordem: z.number().min(1),
  tipo_serie: z.string().min(1, "Obrigatório"),
  series: z.number().min(1, "Mínimo 1"),
  repeticoes: z.string().optional(),
  rir: z.number().min(0).max(10).optional(),
  carga_sugerida: z.string().optional(),
  tecnica_avancada: z.string().optional(),
  descanso_segundos: z.number().min(0).optional(),
  observacoes: z.string().optional(),
})

const rotinaSchema = z.object({
  letra_nome: z.string().min(1, "Ex: A, B, C"),
  exercicios: z.array(exercicioSchema).min(1, "Adicione ao menos 1 exercício"),
})

const semanaSchema = z.object({
  numero_semana: z.number().min(1),
  descricao_fase: z.string().min(1, "Obrigatório"),
  repeticoes_alvo: z.string().min(1, "Obrigatório"),
  rir_alvo: z.number().min(0).max(10).optional(),
  intensidade_carga: z.string().optional(),
})

const fichaAlunoSchema = z.object({
  nome: z.string().min(1, "Nome da ficha é obrigatório"),
  objetivo: z.string().optional(),
  observacoes_gerais: z.string().optional(),
  data_inicio: z.string().min(1, "Data de início é obrigatória"),
  data_vencimento: z.string().optional(),
  semanas: z.array(semanaSchema).min(1, "Adicione ao menos 1 semana"),
  rotinas: z.array(rotinaSchema).min(1, "Adicione ao menos 1 rotina"),
})

type FichaAlunoFormValues = z.infer<typeof fichaAlunoSchema>

export default function CriarFichaAlunoPage() {
  const { tipoPerfil, personalVinculado } = useAuth()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState<StepId>("dados-gerais")

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep)
  const progressPercent = ((currentStepIndex + 1) / STEPS.length) * 100

  const goToStep = useCallback((step: StepId) => setCurrentStep(step), [])
  const goNext = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault()
    const next = currentStepIndex + 1
    if (next < STEPS.length) setCurrentStep(STEPS[next].id)
  }, [currentStepIndex])
  const goPrev = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault()
    const prev = currentStepIndex - 1
    if (prev >= 0) setCurrentStep(STEPS[prev].id)
  }, [currentStepIndex])

  const {
    register, control, handleSubmit, setValue, getValues, watch,
    formState: { errors },
  } = useForm<FichaAlunoFormValues>({
    resolver: zodResolver(fichaAlunoSchema),
    defaultValues: {
      nome: "", objetivo: "", observacoes_gerais: "",
      data_inicio: "", data_vencimento: "",
      semanas: [{ numero_semana: 1, descricao_fase: "", repeticoes_alvo: "", rir_alvo: undefined, intensidade_carga: "" }],
      rotinas: [{ letra_nome: "A", exercicios: [] }],
    },
  })

  const { fields: semanaFields, append: appendSemana, remove: removeSemana } = useFieldArray({ control, name: "semanas" })
  const { fields: rotinaFields, append: appendRotina, remove: removeRotina } = useFieldArray({ control, name: "rotinas" })

  const onSubmit = async (data: FichaAlunoFormValues) => {
    setSubmitting(true)
    try {
      const payload: CriarFichaPayload = {
        nome: data.nome,
        objetivo: data.objetivo || undefined,
        observacoes_gerais: data.observacoes_gerais || undefined,
        data_inicio: data.data_inicio,
        data_vencimento: data.data_vencimento || undefined,
        semanas: data.semanas.map((s) => ({
          ...s, rir_alvo: s.rir_alvo ?? undefined, intensidade_carga: s.intensidade_carga || undefined,
        })),
        rotinas: data.rotinas.map((r) => ({
          letra_nome: r.letra_nome,
          exercicios: r.exercicios.map((e) => ({
            exercicio_id: e.exercicio_id, ordem: e.ordem, tipo_serie: e.tipo_serie, series: e.series,
            repeticoes: e.repeticoes || undefined, rir: e.rir ?? undefined,
            carga_sugerida: e.carga_sugerida || undefined, tecnica_avancada: e.tecnica_avancada || undefined,
            descanso_segundos: e.descanso_segundos ?? undefined, observacoes: e.observacoes || undefined,
          })),
        })),
      }
      await criarFicha(payload)
      setSubmitSuccess(true)
      toast.success("Ficha de treino criada com sucesso!")
      setTimeout(() => router.push("/dashboard/meu-treino"), 1500)
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "message" in err
        ? (err as { message: string }).message : "Erro ao criar ficha de treino."
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  // Guard: apenas alunos sem personal
  if (tipoPerfil !== "aluno" || personalVinculado) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ClipboardList className="size-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-medium">Acesso Restrito</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          {personalVinculado
            ? "Você tem um Personal Trainer vinculado. Solicite a criação da ficha ao seu personal."
            : "Apenas alunos podem criar fichas nesta página."}
        </p>
      </div>
    )
  }

  const LETRAS = ["A", "B", "C", "D", "E", "F", "G", "H"]

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div className="flex items-center gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0"><ArrowLeft className="size-4" /></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Descartar ficha?</AlertDialogTitle>
                <AlertDialogDescription>
                  Todas as informações preenchidas serão perdidas. Tem certeza que deseja sair?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Continuar editando</AlertDialogCancel>
                <AlertDialogAction onClick={() => router.push("/dashboard/meu-treino")}>Descartar e sair</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Criar Meu Treino</h1>
            <p className="text-sm text-muted-foreground">
              Monte sua própria ficha com periodização, rotinas e exercícios.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stepper */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = step.id === currentStep
              const isCompleted = index < currentStepIndex
              return (
                <button key={step.id} type="button" onClick={() => goToStep(step.id)}
                  className={cn(
                    "flex flex-1 items-center gap-3 rounded-lg border p-3 text-left transition-all duration-200",
                    isActive && "border-primary bg-primary/5 shadow-sm",
                    isCompleted && "border-primary/30 bg-primary/5",
                    !isActive && !isCompleted && "border-border hover:border-primary/30 hover:bg-muted/50"
                  )}>
                  <div className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    isActive && "bg-primary text-primary-foreground",
                    isCompleted && "bg-primary/20 text-primary",
                    !isActive && !isCompleted && "bg-muted text-muted-foreground"
                  )}>
                    {isCompleted ? <Check className="size-4" /> : index + 1}
                  </div>
                  <div className="hidden sm:block">
                    <p className={cn("text-sm font-medium", isActive && "text-primary", !isActive && !isCompleted && "text-muted-foreground")}>{step.label}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
          <Progress value={progressPercent} className="h-1" />
          <p className="text-xs text-muted-foreground text-right">Etapa {currentStepIndex + 1} de {STEPS.length}</p>
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <form onSubmit={handleSubmit(onSubmit)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') e.preventDefault() }}>
          <AnimatePresence mode="wait">

            {/* ── Step: Dados Gerais (sem campo Aluno) ── */}
            {currentStep === "dados-gerais" && (
              <motion.div key="dados-gerais" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Informações da Ficha</CardTitle>
                  <CardDescription>Defina o nome, objetivo e período da sua ficha de treino.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Nome da Ficha *</Label>
                      <Input placeholder="Ex: Hipertrofia Fase 1" {...register("nome")} />
                      {errors.nome && <p className="text-xs text-destructive mt-1">{errors.nome.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Objetivo</Label>
                      <Input placeholder="Ex: Aumento de massa muscular" {...register("objetivo")} />
                    </div>
                  </div>

                  <Separator />
                  <div className="space-y-1.5">
                    <Label>Observações Gerais</Label>
                    <Textarea placeholder="Notas gerais, restrições ou cuidados especiais..." className="min-h-20 resize-none" {...register("observacoes_gerais")} />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 flex flex-col">
                      <Label>Data de Início *</Label>
                      <Controller control={control} name="data_inicio" render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(new Date(field.value + "T00:00:00"), "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value ? new Date(field.value + "T00:00:00") : undefined}
                              onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")} initialFocus />
                          </PopoverContent>
                        </Popover>
                      )} />
                      {errors.data_inicio && <p className="text-xs text-destructive">{errors.data_inicio.message}</p>}
                    </div>

                    <div className="space-y-1.5 flex flex-col">
                      <Label>Data de Vencimento</Label>
                      <Controller control={control} name="data_vencimento" render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(new Date(field.value + "T00:00:00"), "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value ? new Date(field.value + "T00:00:00") : undefined}
                              onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")} initialFocus />
                          </PopoverContent>
                        </Popover>
                      )} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            )}

            {/* ── Step: Periodização ── */}
            {currentStep === "periodizacao" && (
              <motion.div key="periodizacao" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Semanas de Periodização</CardTitle>
                  <CardDescription>Defina as fases do mesociclo com volumes e intensidades progressivas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {semanaFields.map((field, index) => (
                    <Card key={field.id} className="border-dashed">
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Semana {index + 1}</span>
                          <div className="flex items-center gap-2">
                            <Button type="button" variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                const cur = getValues(`semanas.${index}`)
                                appendSemana({ numero_semana: cur.numero_semana + 1, descricao_fase: cur.descricao_fase, repeticoes_alvo: cur.repeticoes_alvo, rir_alvo: cur.rir_alvo, intensidade_carga: cur.intensidade_carga })
                              }}>
                              <Copy className="mr-1 size-3.5" /> Clonar
                            </Button>
                            {semanaFields.length > 1 && (
                              <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeSemana(index)}>
                                <Trash2 className="mr-1 size-3.5" /> Remover
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          <div className="space-y-1.5">
                            <Label>Nº da Semana *</Label>
                            <Input type="number" min={1} {...register(`semanas.${index}.numero_semana`, { valueAsNumber: true })} />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Descrição da Fase *</Label>
                            <Input placeholder="Ex: Adaptação" {...register(`semanas.${index}.descricao_fase`)} />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Repetições Alvo *</Label>
                            <Input placeholder="Ex: 12-15" {...register(`semanas.${index}.repeticoes_alvo`)} />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <Label>RIR</Label>
                              <TooltipProvider><Tooltip><TooltipTrigger type="button"><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs"><p>Quantas reps você sente que ainda faria. 0 = falha, 1-2 = pesado, 3-4 = moderado.</p></TooltipContent>
                              </Tooltip></TooltipProvider>
                            </div>
                            <Input type="number" min={0} max={10} {...register(`semanas.${index}.rir_alvo`, { setValueAs: (v: string) => v === "" ? undefined : Number(v) })} />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <Label>Intensidade da Carga</Label>
                              <TooltipProvider><Tooltip><TooltipTrigger type="button"><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs"><p>Referência de carga. Hipertrofia costuma ficar entre 70-85%.</p></TooltipContent>
                              </Tooltip></TooltipProvider>
                            </div>
                            <Input placeholder="Ex: Leve a Moderada" {...register(`semanas.${index}.intensidade_carga`)} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {errors.semanas && !Array.isArray(errors.semanas) && <p className="text-xs text-destructive">{errors.semanas.message}</p>}
                  <Button type="button" variant="outline" size="sm"
                    onClick={() => appendSemana({ numero_semana: semanaFields.length + 1, descricao_fase: "", repeticoes_alvo: "", rir_alvo: undefined, intensidade_carga: "" })}>
                    <Plus className="mr-1.5 size-3.5" /> Adicionar Semana
                  </Button>
                </CardContent>
              </Card>
              </motion.div>
            )}

            {/* ── Step: Sessões (Rotinas) ── */}
            {currentStep === "sessoes" && (
              <motion.div key="sessoes" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Sessões de Treino (Rotinas)</CardTitle>
                  <CardDescription>Monte cada rotina (A, B, C...) com seus exercícios e parâmetros.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {rotinaFields.map((field, rIndex) => (
                    <Card key={field.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
                              {watch(`rotinas.${rIndex}.letra_nome`) || "?"}
                            </div>
                            <div className="space-y-1">
                              <Label>Letra/Nome da Rotina *</Label>
                              <Input className="h-8 w-28" placeholder="A" {...register(`rotinas.${rIndex}.letra_nome`)} />
                            </div>
                          </div>
                          {rotinaFields.length > 1 && (
                            <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeRotina(rIndex)}>
                              <Trash2 className="mr-1 size-3.5" /> Remover Rotina
                            </Button>
                          )}
                        </div>
                        {errors.rotinas?.[rIndex]?.letra_nome && <p className="text-xs text-destructive">{errors.rotinas[rIndex].letra_nome?.message}</p>}
                      </CardHeader>
                      <CardContent>
                        <ExercicioRotinaFields rotinaIndex={rIndex} control={control as any} register={register as any} />
                        {errors.rotinas?.[rIndex]?.exercicios && !Array.isArray(errors.rotinas[rIndex].exercicios) && (
                          <p className="text-xs text-destructive mt-2">{(errors.rotinas[rIndex].exercicios as { message?: string })?.message}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {errors.rotinas && !Array.isArray(errors.rotinas) && <p className="text-xs text-destructive">{errors.rotinas.message}</p>}
                  <Button type="button" variant="outline" size="sm"
                    onClick={() => { const nextLetter = LETRAS[rotinaFields.length] || String.fromCharCode(65 + rotinaFields.length); appendRotina({ letra_nome: nextLetter, exercicios: [] }) }}>
                    <Plus className="mr-1.5 size-3.5" /> Adicionar Rotina
                  </Button>
                </CardContent>
              </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Navigation + Submit */}
          <div className="mt-8 flex items-center justify-between">
            <Button type="button" variant="outline" onClick={goPrev} disabled={currentStepIndex === 0} className="gap-1.5">
              <ChevronLeft className="size-4" /> Voltar
            </Button>
            <div className="flex items-center gap-3">
              {currentStepIndex < STEPS.length - 1 ? (
                <Button type="button" onClick={(e) => goNext(e)} className="gap-1.5">
                  Próximo <ChevronRight className="size-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={submitting || submitSuccess} size="lg" className="gap-2 min-w-[200px]">
                  {submitSuccess ? (<><CheckCircle2 className="size-4" /> Ficha salva com sucesso!</>)
                    : submitting ? (<><Loader2 className="size-4 animate-spin" /> Salvando...</>)
                    : "Salvar Meu Treino"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
