"use client"

import { useState } from "react"
import {
  useFieldArray,
  Controller,
  type Control,
  type UseFormRegister,
  useWatch,
  type FieldValues,
} from "react-hook-form"
import { Plus, Trash2, Dumbbell, Settings2, Loader2, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

import type { Exercicio } from "@/lib/services/treinos"

interface ExercicioRotinaFieldsProps<T extends FieldValues> {
  rotinaIndex: number
  control: Control<T>
  register: UseFormRegister<T>
}

const TIPOS_SERIE = [
  { value: "aquecimento", label: "Aquecimento" },
  { value: "preparacao", label: "Preparação" },
  { value: "trabalho", label: "Trabalho" },
  { value: "mista", label: "Mista" },
]

const TECNICAS_AVANCADAS = [
  { value: "nenhuma", label: "Nenhuma" },
  { value: "drop-set", label: "Drop-set" },
  { value: "bi-set", label: "Bi-set" },
  { value: "rest-pause", label: "Rest-pause" },
  { value: "cluster", label: "Cluster" },
  { value: "ponto_zero", label: "Ponto Zero" },
]

import { ExercicioPickerDialog } from "./exercicio-picker-dialog"

export function ExercicioRotinaFields<T extends FieldValues>({
  rotinaIndex,
  control,
}: ExercicioRotinaFieldsProps<T>) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `rotinas.${rotinaIndex}.exercicios` as any,
  })

  // Watch entire array so the table updates dynamically reacting to inputs that might change outside
  const watchExercicios = useWatch({
    control,
    name: `rotinas.${rotinaIndex}.exercicios` as any,
  })

  const [isModalOpen, setIsModalOpen] = useState(false)

  const [tempData, setTempData] = useState({
    exercicio_id: 0,
    exercicio_nome: "",
    ordem: fields.length + 1,
    tipo_serie: "trabalho",
    series: 3,
    repeticoes: "",
    rir: undefined as number | undefined,
    carga_sugerida: "",
    tecnica_avancada: "nenhuma",
    descanso_segundos: undefined as number | undefined,
    observacoes: "",
  })

  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const handleOpenModal = () => {
    setTempData({
      exercicio_id: 0,
      exercicio_nome: "",
      ordem: fields.length + 1,
      tipo_serie: "trabalho",
      series: 3,
      repeticoes: "",
      rir: undefined,
      carga_sugerida: "",
      tecnica_avancada: "nenhuma",
      descanso_segundos: undefined,
      observacoes: "",
    })
    setIsModalOpen(true)
  }

  const handleAddSubmit = () => {
    if (!tempData.exercicio_id) return
    append({ ...tempData } as any)
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Table Viewer */}
      {fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-10 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
            <Dumbbell className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">
            Nenhum exercício adicionado
          </h3>
          <p className="mb-4 max-w-sm text-sm text-muted-foreground">
            Comece adicionando exercícios a esta sessão. A ordem definirá o
            fluxo de execução para o aluno.
          </p>
        </div>
      ) : (
        <ScrollArea className={cn(fields.length > 5 && "h-[400px]")}>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">Nº</TableHead>
                  <TableHead>Exercício</TableHead>
                  <TableHead>Séries / Reps</TableHead>
                  <TableHead>Intensidade</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, exIndex) => {
                  const currentVal = watchExercicios?.[exIndex] || field
                  return (
                    <TableRow key={field.id} className="hover:bg-muted/30">
                      <TableCell className="text-center font-medium">
                        {exIndex + 1}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {/* @ts-ignore - exercicio_nome exists dynamically */}
                          {currentVal.exercicio_nome || "—"}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="py-0 text-[10px]"
                          >
                            {currentVal.tipo_serie}
                          </Badge>

                          {/* Verifica se tem valor válido E se é diferente de "nenhuma" */}
                          {currentVal.tecnica_avancada &&
                            currentVal.tecnica_avancada !== "nenhuma" && (
                              <Badge
                                variant="outline"
                                className="border-primary/20 py-0 text-[10px] text-muted-foreground"
                              >
                                {currentVal.tecnica_avancada}
                              </Badge>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="rounded-md border bg-background px-2 py-1 text-sm">
                          {currentVal.series} x {currentVal.repeticoes || "?"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5 text-xs text-muted-foreground">
                          <div>RIR: {currentVal.rir ?? "—"}</div>
                          <div>Carga: {currentVal.carga_sugerida || "—"}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => remove(exIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      )}

      {/* Controller Buttons */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full border-dashed"
        onClick={handleOpenModal}
      >
        <Plus className="mr-2 h-4 w-4" />
        Adicionar Exercício
      </Button>

      {/* Dialog to Add Exercise */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="overflow-visible sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              Configurar Novo Exercício
            </DialogTitle>
            <DialogDescription>
              Defina o exercício, séries, técnica e descansos desta sequência.
            </DialogDescription>
          </DialogHeader>

          <div className="grid max-h-[60vh] gap-4 overflow-y-auto px-1 py-4 sm:grid-cols-2">
            {/* Secção de Seleção */}
            <div className="space-y-1.5 focus-within:z-50 sm:col-span-2">
              <Label>Selecione o Exercício *</Label>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full justify-start font-normal",
                  !tempData.exercicio_id && "text-muted-foreground"
                )}
                onClick={() => setIsPickerOpen(true)}
              >
                <Dumbbell className="mr-2 h-4 w-4" />
                {tempData.exercicio_nome || "Buscar exercício..."}
              </Button>
            </div>

            {/* Config Básica */}
            <div className="space-y-1.5">
              <Label>Tipo de Execução *</Label>
              <Select
                value={tempData.tipo_serie}
                onValueChange={(val) =>
                  setTempData({ ...tempData, tipo_serie: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_SERIE.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Técnica Avançada</Label>
              <Select
                value={tempData.tecnica_avancada}
                onValueChange={(val) =>
                  setTempData({ ...tempData, tecnica_avancada: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TECNICAS_AVANCADAS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Volumes */}
            <div className="grid grid-cols-2 gap-4 sm:col-span-2">
              <div className="space-y-1.5">
                <Label>Séries *</Label>
                <Input
                  type="number"
                  min={1}
                  value={tempData.series}
                  onChange={(e) =>
                    setTempData({ ...tempData, series: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Repetições</Label>
                <Input
                  placeholder="Ex: 8-12"
                  value={tempData.repeticoes}
                  onChange={(e) =>
                    setTempData({ ...tempData, repeticoes: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Cargas e Descanso */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label>Repetições em Reserva (RIR)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger type="button">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p>
                        Quantas reps o aluno sente que ainda faria. 0 = falha,
                        1-2 = pesado, 3-4 = moderado.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                type="number"
                min={0}
                max={10}
                placeholder="Ex: 2"
                value={tempData.rir || ""}
                onChange={(e) =>
                  setTempData({
                    ...tempData,
                    rir: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Descanso (Segundos)</Label>
              <Input
                type="number"
                min={0}
                placeholder="Ex: 90"
                value={tempData.descanso_segundos || ""}
                onChange={(e) =>
                  setTempData({
                    ...tempData,
                    descanso_segundos: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>

            <Separator className="sm:col-span-2" />

            <div className="space-y-1.5 sm:col-span-2">
              <Label>
                Carga Sugerida{" "}
                <span className="font-normal text-muted-foreground">
                  (opcional)
                </span>
              </Label>
              <Input
                placeholder="Ex: 20kg, peso moderado, usar halter"
                value={tempData.carga_sugerida}
                onChange={(e) =>
                  setTempData({ ...tempData, carga_sugerida: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Observações de execução</Label>
              <Textarea
                placeholder="Ex: Concentrar excêntrica, manter coluna reta, pegar menos carga..."
                className="min-h-16 resize-none"
                value={tempData.observacoes}
                onChange={(e) =>
                  setTempData({ ...tempData, observacoes: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-2 border-t pt-4">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleAddSubmit}
              disabled={!tempData.exercicio_id}
            >
              Confirmar Exercício
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ExercicioPickerDialog
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        onSelect={(exercicio) => {
          setTempData({
            ...tempData,
            exercicio_id: exercicio.id,
            exercicio_nome: exercicio.nome,
          })
        }}
      />
    </div>
  )
}
