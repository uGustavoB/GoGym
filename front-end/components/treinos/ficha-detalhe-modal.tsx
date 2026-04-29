"use client"

import { useMemo } from "react"
import { format, isAfter, isBefore, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  CalendarDays,
  ClipboardList,
  Copy,
  Dumbbell,
  ExternalLink,
  Info,
  Layers,
  Loader2,
  Pencil,
  Target,
  Timer,
  X,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import type { FichaTreino, RotinaExercicio } from "@/lib/services/treinos"

// ── Helpers ──

function formatDateShort(dateStr: string) {
  return format(new Date(dateStr + "T00:00:00"), "dd MMM yyyy", { locale: ptBR })
}

function formatDateRange(inicio: string, vencimento: string | null) {
  const start = formatDateShort(inicio)
  if (!vencimento) return `${start} → Sem vencimento`
  return `${start} → ${formatDateShort(vencimento)}`
}

function getStatusBadge(inicio: string, vencimento: string | null) {
  const today = startOfDay(new Date())
  const startDate = startOfDay(new Date(inicio + "T00:00:00"))

  if (isBefore(today, startDate)) {
    return { label: "Agendada", variant: "outline" as const }
  }

  if (!vencimento) {
    return { label: "Ativa", variant: "default" as const }
  }

  const endDate = startOfDay(new Date(vencimento + "T00:00:00"))
  if (isAfter(today, endDate)) {
    return { label: "Expirada", variant: "secondary" as const }
  }

  return { label: "Ativa", variant: "default" as const }
}

function formatTipoSerie(tipo: string) {
  const map: Record<string, string> = {
    aquecimento: "Aquecimento",
    preparacao: "Preparação",
    trabalho: "Trabalho",
    mista: "Mista",
  }
  return map[tipo] || tipo
}

function formatTipo(tipo: string) {
  const map: Record<string, string> = {
    superior: "Superior",
    inferior: "Inferior",
    core: "Core",
    cardio: "Cardio",
    full_body: "Full Body",
  }
  return map[tipo] || tipo
}

// ── Props ──

interface FichaDetalheModalProps {
  open: boolean
  onClose: () => void
  ficha: FichaTreino | null
  loading: boolean
  alunoNome: string
  onDuplicate?: (ficha: FichaTreino) => void
}

// ── Loading Skeleton ──

function ModalSkeleton() {
  return (
    <div className="space-y-6 py-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-9 w-full" />
      <div className="space-y-3">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  )
}

// ── Empty State ──

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

// ── Data Field ──

function DataField({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={muted ? "text-sm text-muted-foreground italic" : "text-sm font-medium"}>{value}</p>
    </div>
  )
}

// ── Exercise Card ──

function ExercicioCard({ exercicio }: { exercicio: RotinaExercicio }) {
  const ex = exercicio.exercicio

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3 transition-colors hover:bg-muted/30">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <p className="text-sm font-semibold leading-tight truncate">
            {ex?.nome || "Exercício removido"}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {ex?.grupo_muscular && (
              <Badge variant="secondary" className="text-[10px] py-0">
                {ex.grupo_muscular}
              </Badge>
            )}
            {ex?.tipo && (
              <Badge variant="outline" className="text-[10px] py-0">
                {formatTipo(ex.tipo)}
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px] py-0 border-primary/20 text-primary">
              {formatTipoSerie(exercicio.tipo_serie)}
            </Badge>
            {exercicio.tecnica_avancada && exercicio.tecnica_avancada !== "nenhuma" && (
              <Badge variant="outline" className="text-[10px] py-0 border-amber-500/30 text-amber-600 dark:text-amber-400">
                {exercicio.tecnica_avancada}
              </Badge>
            )}
          </div>
        </div>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
          {exercicio.ordem}
        </span>
      </div>

      {/* Params Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-md bg-muted/50 px-2.5 py-1.5 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Séries</p>
          <p className="text-sm font-semibold">{exercicio.series}</p>
        </div>
        <div className="rounded-md bg-muted/50 px-2.5 py-1.5 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Reps</p>
          <p className="text-sm font-semibold">{exercicio.repeticoes || "—"}</p>
        </div>
        <div className="rounded-md bg-muted/50 px-2.5 py-1.5 text-center">
          <p className="text-[10px] text-muted-foreground uppercase flex items-center justify-center gap-1">
            RIR
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger type="button">
                  <Info className="size-3" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p>Repetições em Reserva — quantas reps o aluno sentiria que ainda faria.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </p>
          <p className="text-sm font-semibold">{exercicio.rir ?? "—"}</p>
        </div>
        <div className="rounded-md bg-muted/50 px-2.5 py-1.5 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Descanso</p>
          <p className="text-sm font-semibold">
            {exercicio.descanso_segundos ? `${exercicio.descanso_segundos}s` : "—"}
          </p>
        </div>
      </div>

      {/* Extra info */}
      {(exercicio.carga_sugerida || exercicio.observacoes || ex?.video_url) && (
        <>
          <Separator />
          <div className="space-y-1.5">
            {exercicio.carga_sugerida && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Carga:</span> {exercicio.carga_sugerida}
              </p>
            )}
            {exercicio.observacoes && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Obs:</span> {exercicio.observacoes}
              </p>
            )}
            {ex?.video_url && (
              <a
                href={ex.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="size-3" />
                Ver vídeo demonstrativo
              </a>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── Main Component ──

export function FichaDetalheModal({
  open,
  onClose,
  ficha,
  loading,
  alunoNome,
  onDuplicate,
}: FichaDetalheModalProps) {
  const status = useMemo(
    () => ficha ? getStatusBadge(ficha.data_inicio, ficha.data_vencimento) : null,
    [ficha]
  )

  const totalExercicios = useMemo(
    () => ficha?.rotinas?.reduce((acc, r) => acc + (r.exercicios?.length || 0), 0) || 0,
    [ficha]
  )

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl sm:max-w-4xl w-[95vw] sm:w-[90vw] flex-col gap-0 p-0">
        {/* Accessible hidden description */}
        <DialogHeader className="sr-only">
          <DialogTitle>Detalhes da Ficha de Treino</DialogTitle>
          <DialogDescription>
            Visualização completa da ficha com periodização e sessões.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="p-6">
            <ModalSkeleton />
          </div>
        ) : !ficha ? (
          <div className="p-6">
            <EmptyState
              icon={ClipboardList}
              message="Não foi possível carregar os dados da ficha."
            />
          </div>
        ) : (
          <>
            {/* ── Custom Header ── */}
            <div className="flex items-start justify-between gap-4 border-b px-6 py-5">
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="truncate text-xl font-semibold tracking-tight">
                    {ficha.nome}
                  </h2>
                  {status && (
                    <Badge variant={status.variant} className="shrink-0">
                      {status.label}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {alunoNome}
                  </span>
                  <span className="text-muted-foreground/50">·</span>
                  <span>
                    {formatDateRange(ficha.data_inicio, ficha.data_vencimento)}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Tabs Content ── */}
            <Tabs
              defaultValue="visao-geral"
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="border-b px-6">
                <TabsList variant="line" className="w-full sm:w-auto">
                  <TabsTrigger value="visao-geral" className="gap-1.5">
                    <ClipboardList className="size-3.5" />
                    Visão Geral
                  </TabsTrigger>
                  <TabsTrigger value="periodizacao" className="gap-1.5">
                    <CalendarDays className="size-3.5" />
                    Periodização
                  </TabsTrigger>
                  <TabsTrigger value="sessoes" className="gap-1.5">
                    <Layers className="size-3.5" />
                    Sessões
                    {totalExercicios > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-1 px-1.5 py-0 text-[10px]"
                      >
                        {totalExercicios}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-6">
                  {/* ── Tab: Visão Geral ── */}
                  <TabsContent value="visao-geral" className="mt-0">
                    <div className="space-y-6">
                      {/* Stats Row */}
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <Card className="shadow-none">
                          <CardContent className="p-3 text-center">
                            <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
                              Semanas
                            </p>
                            <p className="text-2xl font-bold">
                              {ficha.semanas?.length || 0}
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="shadow-none">
                          <CardContent className="p-3 text-center">
                            <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
                              Sessões
                            </p>
                            <p className="text-2xl font-bold">
                              {ficha.rotinas?.length || 0}
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="shadow-none">
                          <CardContent className="p-3 text-center">
                            <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
                              Exercícios
                            </p>
                            <p className="text-2xl font-bold">
                              {totalExercicios}
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="shadow-none">
                          <CardContent className="p-3 text-center">
                            <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
                              Status
                            </p>
                            <p className="text-2xl font-bold">
                              {status?.label}
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Details */}
                      <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Detalhes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <DataField
                              label="Objetivo"
                              value={
                                ficha.objetivo || "Nenhum objetivo definido"
                              }
                              muted={!ficha.objetivo}
                            />
                            <DataField
                              label="Início"
                              value={format(
                                new Date(ficha.data_inicio + "T00:00:00"),
                                "dd 'de' MMMM, yyyy",
                                { locale: ptBR }
                              )}
                            />
                            <DataField
                              label="Vencimento"
                              value={
                                ficha.data_vencimento
                                  ? format(
                                      new Date(
                                        ficha.data_vencimento + "T00:00:00"
                                      ),
                                      "dd 'de' MMMM, yyyy",
                                      { locale: ptBR }
                                    )
                                  : "Sem vencimento definido"
                              }
                              muted={!ficha.data_vencimento}
                            />
                            <DataField
                              label="Criado em"
                              value={format(
                                new Date(ficha.cadastrado_em),
                                "dd/MM/yyyy 'às' HH:mm",
                                { locale: ptBR }
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Observações */}
                      <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">
                            Observações Gerais
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {ficha.observacoes_gerais ? (
                            <p className="text-sm leading-relaxed whitespace-pre-line">
                              {ficha.observacoes_gerais}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              Nenhuma observação adicionada.
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* ── Tab: Periodização ── */}
                  <TabsContent value="periodizacao" className="mt-0">
                    {!ficha.semanas || ficha.semanas.length === 0 ? (
                      <EmptyState
                        icon={CalendarDays}
                        message="Nenhuma semana de periodização configurada."
                      />
                    ) : (
                      <div className="space-y-4">
                        {ficha.semanas
                          .sort((a, b) => a.numero_semana - b.numero_semana)
                          .map((semana, idx) => (
                            <Card key={semana.id} className="shadow-sm">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5">
                                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                      {semana.numero_semana}
                                    </div>
                                    <div>
                                      <CardTitle className="text-sm">
                                        Semana {semana.numero_semana}
                                      </CardTitle>
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="text-sm">
                                    {semana.descricao_fase}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                  <DataField
                                    label="Repetições Alvo"
                                    value={semana.repeticoes_alvo}
                                  />
                                  <div className="space-y-1">
                                    <p className="gap-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                      Repetições em Reserva
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger type="button">
                                            <Info className="size-3" />
                                          </TooltipTrigger>
                                          <TooltipContent
                                            side="top"
                                            className="max-w-xs"
                                          >
                                            <p>
                                              Repetições em Reserva — quantas reps o aluno sentiria que ainda faria.
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </p>
                                    <p className="text-sm font-medium">
                                      {semana.rir_alvo ?? "Não definido"}
                                    </p>
                                  </div>
                                  <DataField
                                    label="Intensidade"
                                    value={
                                      semana.intensidade_carga || "Não definida"
                                    }
                                    muted={!semana.intensidade_carga}
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* ── Tab: Sessões ── */}
                  <TabsContent value="sessoes" className="mt-0">
                    {!ficha.rotinas || ficha.rotinas.length === 0 ? (
                      <EmptyState
                        icon={Dumbbell}
                        message="Nenhuma sessão de treino configurada."
                      />
                    ) : (
                      <div className="space-y-6">
                        {ficha.rotinas.map((rotina) => (
                          <Card key={rotina.id} className="shadow-sm">
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground">
                                  {rotina.letra_nome}
                                </div>
                                <div>
                                  <CardTitle className="text-sm">
                                    Treino {rotina.letra_nome}
                                  </CardTitle>
                                  <CardDescription className="text-xs">
                                    {rotina.exercicios?.length || 0} exercício
                                    {(rotina.exercicios?.length || 0) !== 1
                                      ? "s"
                                      : ""}
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {!rotina.exercicios ||
                              rotina.exercicios.length === 0 ? (
                                <EmptyState
                                  icon={Dumbbell}
                                  message="Nenhum exercício configurado nesta sessão."
                                />
                              ) : (
                                <div className="space-y-3">
                                  {rotina.exercicios
                                    .sort((a, b) => a.ordem - b.ordem)
                                    .map((exercicio) => (
                                      <ExercicioCard
                                        key={exercicio.id}
                                        exercicio={exercicio}
                                      />
                                    ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
