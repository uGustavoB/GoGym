"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import {
  Loader2,
  Plus,
  Trash2,
  ClipboardList,
  CalendarDays,
  Layers,
  Check,
  ChevronsUpDown,
  Copy,
  Calendar as CalendarIcon,
  Info,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import {
  listarAlunosRequest,
  type AlunoResource,
  type PaginatedResponse,
} from "@/lib/api"
import {
  criarFicha,
  listarExercicios,
  type Exercicio,
  type CriarFichaPayload,
} from "@/lib/services/treinos"
import { ExercicioRotinaFields } from "@/components/treinos/exercicio-rotina-fields"
import type { Variants } from "framer-motion"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// ── Zod Schema ──

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

const fichaSchema = z.object({
  aluno_id: z.number().min(1, "Selecione um aluno"),
  nome: z.string().min(1, "Nome da ficha é obrigatório"),
  objetivo: z.string().optional(),
  observacoes_gerais: z.string().optional(),
  data_inicio: z.string().min(1, "Data de início é obrigatória"),
  data_vencimento: z.string().optional(),
  semanas: z.array(semanaSchema).min(1, "Adicione ao menos 1 semana"),
  rotinas: z.array(rotinaSchema).min(1, "Adicione ao menos 1 rotina"),
})

export type FichaFormValues = z.infer<typeof fichaSchema>

export default function CriarFichaPage() {
  const { tipoPerfil } = useAuth()
  const [alunos, setAlunos] = useState<AlunoResource[]>([])
  const [exercicios, setExercicios] = useState<Exercicio[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Controle do Popover do Aluno
  const [openAluno, setOpenAluno] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm<FichaFormValues>({
    resolver: zodResolver(fichaSchema),
    defaultValues: {
      aluno_id: 0,
      nome: "",
      objetivo: "",
      observacoes_gerais: "",
      data_inicio: "",
      data_vencimento: "",
      semanas: [
        {
          numero_semana: 1,
          descricao_fase: "",
          repeticoes_alvo: "",
          rir_alvo: undefined,
          intensidade_carga: "",
        },
      ],
      rotinas: [
        {
          letra_nome: "A",
          exercicios: [],
        },
      ],
    },
  })

  const {
    fields: semanaFields,
    append: appendSemana,
    remove: removeSemana,
  } = useFieldArray({ control, name: "semanas" })

  const {
    fields: rotinaFields,
    append: appendRotina,
    remove: removeRotina,
  } = useFieldArray({ control, name: "rotinas" })

  // Carrega alunos e exercícios ao montar
  useEffect(() => {
    async function fetchData() {
      try {
        const [alunosRes, exerciciosRes] = await Promise.all([
          listarAlunosRequest(1, {}),
          listarExercicios(1),
        ])
        setAlunos(alunosRes.data)

        // Buscar todas as páginas de exercícios
        let allExercicios = [...exerciciosRes.data]
        let currentPage = 1
        const totalPages = exerciciosRes.meta.last_page
        while (currentPage < totalPages) {
          currentPage++
          const nextPage = await listarExercicios(currentPage)
          allExercicios = [...allExercicios, ...nextPage.data]
        }
        setExercicios(allExercicios)
      } catch {
        toast.error("Erro ao carregar dados. Recarregue a página.")
      } finally {
        setLoadingData(false)
      }
    }
    fetchData()
  }, [])

  const onSubmit = async (data: FichaFormValues) => {
    setSubmitting(true)
    try {
      // Limpar campos opcionais vazios
      const payload: CriarFichaPayload = {
        aluno_id: data.aluno_id,
        nome: data.nome,
        objetivo: data.objetivo || undefined,
        observacoes_gerais: data.observacoes_gerais || undefined,
        data_inicio: data.data_inicio,
        data_vencimento: data.data_vencimento || undefined,
        semanas: data.semanas.map((s) => ({
          ...s,
          rir_alvo: s.rir_alvo ?? undefined,
          intensidade_carga: s.intensidade_carga || undefined,
        })),
        rotinas: data.rotinas.map((r) => ({
          letra_nome: r.letra_nome,
          exercicios: r.exercicios.map((e) => ({
            exercicio_id: e.exercicio_id,
            ordem: e.ordem,
            tipo_serie: e.tipo_serie,
            series: e.series,
            repeticoes: e.repeticoes || undefined,
            rir: e.rir ?? undefined,
            carga_sugerida: e.carga_sugerida || undefined,
            tecnica_avancada: e.tecnica_avancada || undefined,
            descanso_segundos: e.descanso_segundos ?? undefined,
            observacoes: e.observacoes || undefined,
          })),
        })),
      }

      await criarFicha(payload)
      toast.success("Ficha de treino criada com sucesso!")
      reset()
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Erro ao criar ficha de treino."
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  // Guard: apenas personal
  if (tipoPerfil !== "personal") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ClipboardList className="size-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-medium">Acesso Restrito</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Apenas Personal Trainers podem criar fichas de treino.
        </p>
      </div>
    )
  }

  if (loadingData) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  const LETRAS = ["A", "B", "C", "D", "E", "F", "G", "H"]

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Criar Ficha de Treino
          </h1>
          <p className="text-muted-foreground">
            Monte uma ficha completa com periodização, rotinas e exercícios.
          </p>
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="dados-gerais" className="w-full">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="dados-gerais" className="gap-1.5">
                <ClipboardList className="size-3.5" />
                Dados Gerais
              </TabsTrigger>
              <TabsTrigger value="periodizacao" className="gap-1.5">
                <CalendarDays className="size-3.5" />
                Periodização
              </TabsTrigger>
              <TabsTrigger value="sessoes" className="gap-1.5">
                <Layers className="size-3.5" />
                Sessões
              </TabsTrigger>
            </TabsList>

            {/* ── Tab: Dados Gerais ── */}
            <TabsContent value="dados-gerais" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Informações da Ficha
                  </CardTitle>
                  <CardDescription>
                    Defina o aluno, nome, objetivo e período da ficha.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Aluno */}
                  <div className="space-y-1.5 flex flex-col">
                    <Label>Aluno *</Label>
                    <Popover open={openAluno} onOpenChange={setOpenAluno}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openAluno}
                          className={cn(
                            "w-full justify-between font-normal",
                            !watch("aluno_id") && "text-muted-foreground"
                          )}
                        >
                          {watch("aluno_id")
                            ? alunos.find((a) => a.id === watch("aluno_id"))?.nome
                            : "Selecione um aluno..."}
                          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full sm:w-[400px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar aluno..." />
                          <CommandList>
                            <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
                            <CommandGroup>
                              {alunos
                                .filter((a) => a.status_vinculo === "ativo")
                                .map((a) => (
                                  <CommandItem
                                    key={a.id}
                                    value={a.nome}
                                    onSelect={() => {
                                      setValue("aluno_id", a.id, { shouldValidate: true })
                                      setOpenAluno(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 size-4",
                                        watch("aluno_id") === a.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {a.nome} — {a.email}
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {errors.aluno_id && (
                      <p className="text-xs text-destructive">
                        {errors.aluno_id.message}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Nome */}
                    <div className="space-y-1.5">
                      <Label>Nome da Ficha *</Label>
                      <Input
                        placeholder="Ex: Hipertrofia Fase 1"
                        {...register("nome")}
                      />
                      {errors.nome && (
                        <p className="text-xs text-destructive">
                          {errors.nome.message}
                        </p>
                      )}
                    </div>

                    {/* Objetivo */}
                    <div className="space-y-1.5">
                      <Label>Objetivo</Label>
                      <Input
                        placeholder="Ex: Aumento de massa muscular"
                        {...register("objetivo")}
                      />
                    </div>
                  </div>

                  {/* Observações */}
                  <div className="space-y-1.5">
                    <Label>Observações Gerais</Label>
                    <Input
                      placeholder="Notas gerais sobre a ficha..."
                      {...register("observacoes_gerais")}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Data Início */}
                    <div className="space-y-1.5 flex flex-col">
                      <Label>Data de Início *</Label>
                      <Controller
                        control={control}
                        name="data_inicio"
                        render={({ field }) => (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(new Date(field.value + "T00:00:00"), "PPP", { locale: ptBR })
                                ) : (
                                  <span>Selecione a data</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value ? new Date(field.value + "T00:00:00") : undefined}
                                onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      />
                      {errors.data_inicio && (
                        <p className="text-xs text-destructive">
                          {errors.data_inicio.message}
                        </p>
                      )}
                    </div>

                    {/* Data Vencimento */}
                    <div className="space-y-1.5 flex flex-col">
                      <Label>Data de Vencimento</Label>
                      <Controller
                        control={control}
                        name="data_vencimento"
                        render={({ field }) => (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(new Date(field.value + "T00:00:00"), "PPP", { locale: ptBR })
                                ) : (
                                  <span>Selecione a data</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value ? new Date(field.value + "T00:00:00") : undefined}
                                onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Tab: Periodização (Semanas) ── */}
            <TabsContent value="periodizacao" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Semanas de Periodização
                  </CardTitle>
                  <CardDescription>
                    Defina as fases do mesociclo com volumes e intensidades
                    progressivas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {semanaFields.map((field, index) => (
                    <Card key={field.id} className="border-dashed">
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Semana {index + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                const currentWeek = getValues(`semanas.${index}`)
                                appendSemana({
                                  numero_semana: currentWeek.numero_semana + 1,
                                  descricao_fase: currentWeek.descricao_fase,
                                  repeticoes_alvo: currentWeek.repeticoes_alvo,
                                  rir_alvo: currentWeek.rir_alvo,
                                  intensidade_carga: currentWeek.intensidade_carga,
                                })
                              }}
                            >
                              <Copy className="mr-1 size-3.5" />
                              Clonar
                            </Button>
                            {semanaFields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeSemana(index)}
                              >
                                <Trash2 className="mr-1 size-3.5" />
                                Remover
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          <div className="space-y-1.5">
                            <Label>Nº da Semana *</Label>
                            <Input
                              type="number"
                              min={1}
                              {...register(`semanas.${index}.numero_semana`, {
                                valueAsNumber: true,
                              })}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label>Descrição da Fase *</Label>
                            <Input
                              placeholder="Ex: Adaptação"
                              {...register(`semanas.${index}.descricao_fase`)}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label>Repetições Alvo *</Label>
                            <Input
                              placeholder="Ex: 12-15"
                              {...register(`semanas.${index}.repeticoes_alvo`)}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <Label>RIR Alvo</Label>
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                  <div className="space-y-1">
                                    <h4 className="text-sm font-semibold">RIR (Repetições na Reserva)</h4>
                                    <p className="text-sm text-muted-foreground">
                                      Quantas repetições o aluno deve sentir que ainda conseguiria fazer (sobrando) ao final da série. 
                                      <br/><br/>
                                      0 = Falha total<br/>
                                      1-2 = Muito pesado<br/>
                                      3-4 = Moderado
                                    </p>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            </div>
                            <Input
                              type="number"
                              min={0}
                              max={10}
                              {...register(`semanas.${index}.rir_alvo`, {
                                setValueAs: (v: string) =>
                                  v === "" ? undefined : Number(v),
                              })}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <Label>Intensidade da Carga</Label>
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                  <div className="space-y-1">
                                    <h4 className="text-sm font-semibold">Intensidade (%)</h4>
                                    <p className="text-sm text-muted-foreground">
                                      Referência do peso baseada na força máxima do aluno. Se o foco é hipertrofia/força, costuma ficar entre 70 e 85%.
                                    </p>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            </div>
                            <Input
                              placeholder="Ex: Leve a Moderada"
                              {...register(
                                `semanas.${index}.intensidade_carga`
                              )}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {errors.semanas && !Array.isArray(errors.semanas) && (
                    <p className="text-xs text-destructive">
                      {errors.semanas.message}
                    </p>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendSemana({
                        numero_semana: semanaFields.length + 1,
                        descricao_fase: "",
                        repeticoes_alvo: "",
                        rir_alvo: undefined,
                        intensidade_carga: "",
                      })
                    }
                  >
                    <Plus className="mr-1.5 size-3.5" />
                    Adicionar Semana
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Tab: Sessões (Rotinas) ── */}
            <TabsContent value="sessoes" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Sessões de Treino (Rotinas)
                  </CardTitle>
                  <CardDescription>
                    Monte cada rotina (A, B, C...) com seus exercícios e
                    parâmetros.
                  </CardDescription>
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
                              <Input
                                className="h-8 w-28"
                                placeholder="A"
                                {...register(`rotinas.${rIndex}.letra_nome`)}
                              />
                            </div>
                          </div>
                          {rotinaFields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeRotina(rIndex)}
                            >
                              <Trash2 className="mr-1 size-3.5" />
                              Remover Rotina
                            </Button>
                          )}
                        </div>
                        {errors.rotinas?.[rIndex]?.letra_nome && (
                          <p className="text-xs text-destructive">
                            {errors.rotinas[rIndex].letra_nome?.message}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <ExercicioRotinaFields
                          rotinaIndex={rIndex}
                          control={control}
                          register={register}
                          exercicios={exercicios}
                        />
                        {errors.rotinas?.[rIndex]?.exercicios &&
                          !Array.isArray(errors.rotinas[rIndex].exercicios) && (
                            <p className="text-xs text-destructive mt-2">
                              {(errors.rotinas[rIndex].exercicios as { message?: string })?.message}
                            </p>
                          )}
                      </CardContent>
                    </Card>
                  ))}

                  {errors.rotinas && !Array.isArray(errors.rotinas) && (
                    <p className="text-xs text-destructive">
                      {errors.rotinas.message}
                    </p>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const nextLetter =
                        LETRAS[rotinaFields.length] ||
                        String.fromCharCode(65 + rotinaFields.length)
                      appendRotina({
                        letra_nome: nextLetter,
                        exercicios: [],
                      })
                    }}
                  >
                    <Plus className="mr-1.5 size-3.5" />
                    Adicionar Rotina
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Submit */}
          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={submitting} size="lg">
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Salvar Ficha de Treino
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
