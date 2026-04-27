"use client"

import { useState } from "react"
import { useFieldArray, type Control, type UseFormRegister } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"
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
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import type { Exercicio } from "@/lib/services/treinos"
import type { FichaFormValues } from "@/app/dashboard/treinos/criar/page"

interface ExercicioRotinaFieldsProps {
  rotinaIndex: number
  control: Control<FichaFormValues>
  register: UseFormRegister<FichaFormValues>
  exercicios: Exercicio[]
  setValue: (name: `rotinas.${number}.exercicios.${number}.exercicio_id`, value: number) => void
  getValues: (name: `rotinas.${number}.exercicios.${number}.exercicio_id`) => number | undefined
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
  register,
  exercicios,
  setValue,
  getValues,
}: ExercicioRotinaFieldsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `rotinas.${rotinaIndex}.exercicios`,
  })

  return (
    <div className="space-y-3">
      {fields.map((field, exIndex) => (
        <Card key={field.id} className="border-dashed">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Exercício #{exIndex + 1}
              </span>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => remove(exIndex)}
                >
                  <Trash2 className="mr-1 size-3.5" />
                  Remover
                </Button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* Exercício Select */}
              <div className="space-y-1.5 sm:col-span-2 flex flex-col">
                <Label>Exercício *</Label>
                <ExercicioCombobox
                  exercicios={exercicios}
                  value={getValues(`rotinas.${rotinaIndex}.exercicios.${exIndex}.exercicio_id`)}
                  onChange={(val) =>
                    setValue(`rotinas.${rotinaIndex}.exercicios.${exIndex}.exercicio_id`, val)
                  }
                />
              </div>

              {/* Ordem */}
              <div className="space-y-1.5">
                <Label>Ordem *</Label>
                <Input
                  type="number"
                  min={1}
                  {...register(`rotinas.${rotinaIndex}.exercicios.${exIndex}.ordem`, {
                    valueAsNumber: true,
                  })}
                />
              </div>

              {/* Tipo Série */}
              <div className="space-y-1.5">
                <Label>Tipo de Série *</Label>
                <Select
                  value={getValues(`rotinas.${rotinaIndex}.exercicios.${exIndex}.tipo_serie` as `rotinas.${number}.exercicios.${number}.exercicio_id`)?.toString() || "trabalho"}
                  onValueChange={(val) =>
                    setValue(`rotinas.${rotinaIndex}.exercicios.${exIndex}.tipo_serie` as `rotinas.${number}.exercicios.${number}.exercicio_id`, val as unknown as number)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_SERIE.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Séries */}
              <div className="space-y-1.5">
                <Label>Séries *</Label>
                <Input
                  type="number"
                  min={1}
                  {...register(`rotinas.${rotinaIndex}.exercicios.${exIndex}.series`, {
                    valueAsNumber: true,
                  })}
                />
              </div>

              {/* Repetições */}
              <div className="space-y-1.5">
                <Label>Repetições</Label>
                <Input
                  placeholder="Ex: 12 ou 10-12"
                  {...register(`rotinas.${rotinaIndex}.exercicios.${exIndex}.repeticoes`)}
                />
              </div>

              {/* RIR */}
              <div className="space-y-1.5">
                <Label>RIR</Label>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  placeholder="0-10"
                  {...register(`rotinas.${rotinaIndex}.exercicios.${exIndex}.rir`, {
                    setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
                  })}
                />
              </div>

              {/* Carga Sugerida */}
              <div className="space-y-1.5">
                <Label>Carga Sugerida</Label>
                <Input
                  placeholder="Ex: 20kg cada lado"
                  {...register(`rotinas.${rotinaIndex}.exercicios.${exIndex}.carga_sugerida`)}
                />
              </div>

              {/* Técnica Avançada */}
              <div className="space-y-1.5">
                <Label>Técnica Avançada</Label>
                <Select
                  value={getValues(`rotinas.${rotinaIndex}.exercicios.${exIndex}.tecnica_avancada` as `rotinas.${number}.exercicios.${number}.exercicio_id`)?.toString() || "nenhuma"}
                  onValueChange={(val) =>
                    setValue(`rotinas.${rotinaIndex}.exercicios.${exIndex}.tecnica_avancada` as `rotinas.${number}.exercicios.${number}.exercicio_id`, val as unknown as number)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TECNICAS_AVANCADAS.map((tec) => (
                      <SelectItem key={tec.value} value={tec.value}>
                        {tec.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Descanso */}
              <div className="space-y-1.5">
                <Label>Descanso (seg)</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="90"
                  {...register(`rotinas.${rotinaIndex}.exercicios.${exIndex}.descanso_segundos`, {
                    setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
                  })}
                />
              </div>

              {/* Observações */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Observações</Label>
                <Input
                  placeholder="Notas sobre execução..."
                  {...register(`rotinas.${rotinaIndex}.exercicios.${exIndex}.observacoes`)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({
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
        }
      >
        <Plus className="mr-1.5 size-3.5" />
        Adicionar Exercício
      </Button>
    </div>
  )
}
