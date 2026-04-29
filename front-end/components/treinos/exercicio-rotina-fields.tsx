"use client"

import { useState } from "react"
import { useFieldArray, Controller, type Control, type UseFormRegister, useWatch } from "react-hook-form"
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
import type { FichaFormValues } from "@/app/dashboard/treinos/criar/page"

interface ExercicioRotinaFieldsProps {
  rotinaIndex: number
  control: Control<FichaFormValues>
  register: UseFormRegister<FichaFormValues>
  exercicios: Exercicio[]
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

function ExercicioCombobox({
  exercicios,
  value,
  onChange,
}: {
  exercicios: Exercicio[]
  value?: number
  onChange: (val: number) => void
}) {
  const [open, setOpen] = useState(false)
  const selectedEx = exercicios.find((ex) => ex.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground"
          )}
        >
          {selectedEx
            ? `${selectedEx.nome} — ${selectedEx.grupo_muscular}`
            : "Selecione um exercício..."}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full sm:w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar exercício (nome ou grupo)..." />
          <CommandList>
            <CommandEmpty>Nenhum exercício encontrado.</CommandEmpty>
            <CommandGroup>
              {exercicios.map((ex) => (
                <CommandItem
                  key={ex.id}
                  value={`${ex.nome} ${ex.grupo_muscular}`}
                  onSelect={() => {
                    onChange(ex.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === ex.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {ex.nome} — {ex.grupo_muscular}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function ExercicioRotinaFields({
  rotinaIndex,
  control,
  exercicios,
}: ExercicioRotinaFieldsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `rotinas.${rotinaIndex}.exercicios`,
  })

  // Watch entire array so the table updates dynamically reacting to inputs that might change outside
  const watchExercicios = useWatch({ control, name: `rotinas.${rotinaIndex}.exercicios` })

  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Estado isolado temporário para o modal
  const [tempData, setTempData] = useState({
    exercicio_id: 0,
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

  const handleOpenModal = () => {
    setTempData({
      exercicio_id: 0,
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
    append({ ...tempData })
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Table Viewer */}
      {fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 text-center rounded-lg border border-dashed bg-muted/20">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-4">
            <Dumbbell className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">Nenhum exercício adicionado</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            Comece adicionando exercícios a esta sessão. A ordem definirá o fluxo de execução para o aluno.
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
                const foundEx = exercicios.find(e => e.id === currentVal.exercicio_id)
                return (
                  <TableRow key={field.id} className="hover:bg-muted/30">
                    <TableCell className="text-center font-medium">
                      {exIndex + 1}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">
                        {foundEx ? foundEx.nome : "—"}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px] py-0">{currentVal.tipo_serie}</Badge>
                        {currentVal.tecnica_avancada !== "nenhuma" && (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground py-0 border-primary/20">
                            {currentVal.tecnica_avancada}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm border py-1 px-2 rounded-md bg-background">
                        {currentVal.series} x {currentVal.repeticoes || "?"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-0.5 text-muted-foreground">
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
        <DialogContent className="sm:max-w-[650px] overflow-visible">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              Configurar Novo Exercício
            </DialogTitle>
            <DialogDescription>
              Defina o exercício, séries, técnica e descansos desta sequência.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 sm:grid-cols-2 max-h-[60vh] overflow-y-auto px-1">
            {/* Secção de Seleção */}
            <div className="sm:col-span-2 space-y-1.5 focus-within:z-50">
              <Label>Selecione o Exercício *</Label>
              <ExercicioCombobox
                exercicios={exercicios}
                value={tempData.exercicio_id}
                onChange={(val) => setTempData({...tempData, exercicio_id: val})}
              />
            </div>

            {/* Config Básica */}
            <div className="space-y-1.5">
              <Label>Tipo de Execução *</Label>
              <Select 
                value={tempData.tipo_serie} 
                onValueChange={(val) => setTempData({...tempData, tipo_serie: val})}
              >
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  {TIPOS_SERIE.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Técnica Avançada</Label>
              <Select 
                value={tempData.tecnica_avancada} 
                onValueChange={(val) => setTempData({...tempData, tecnica_avancada: val})}
              >
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  {TECNICAS_AVANCADAS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Volumes */}
            <div className="grid grid-cols-2 gap-4 sm:col-span-2">
              <div className="space-y-1.5">
                <Label>Séries *</Label>
                <Input 
                  type="number" min={1} 
                  value={tempData.series} 
                  onChange={e => setTempData({...tempData, series: Number(e.target.value)})} 
                />
              </div>
              <div className="space-y-1.5">
                <Label>Repetições</Label>
                <Input 
                  placeholder="Ex: 8-12" 
                  value={tempData.repeticoes} 
                  onChange={e => setTempData({...tempData, repeticoes: e.target.value})} 
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
                      <p>Quantas reps o aluno sente que ainda faria. 0 = falha, 1-2 = pesado, 3-4 = moderado.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input 
                type="number" min={0} max={10} placeholder="Ex: 2"
                value={tempData.rir || ""} 
                onChange={e => setTempData({...tempData, rir: e.target.value ? Number(e.target.value) : undefined})} 
              />
            </div>

            <div className="space-y-1.5">
              <Label>Descanso (Segundos)</Label>
              <Input 
                type="number" min={0} placeholder="Ex: 90"
                value={tempData.descanso_segundos || ""} 
                onChange={e => setTempData({...tempData, descanso_segundos: e.target.value ? Number(e.target.value) : undefined})} 
              />
            </div>

            <Separator className="sm:col-span-2" />

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Carga Sugerida <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <Input 
                placeholder="Ex: 20kg, peso moderado, usar halter"
                value={tempData.carga_sugerida} 
                onChange={e => setTempData({...tempData, carga_sugerida: e.target.value})} 
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Observações de execução</Label>
              <Textarea 
                placeholder="Ex: Concentrar excêntrica, manter coluna reta, pegar menos carga..."
                className="min-h-16 resize-none"
                value={tempData.observacoes} 
                onChange={e => setTempData({...tempData, observacoes: e.target.value})} 
              />
            </div>
          </div>

          <DialogFooter className="mt-2 pt-4 border-t">
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancelar</Button>
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
    </div>
  )
}
