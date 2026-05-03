"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Exercicio, CriarExercicioPayload, AtualizarExercicioPayload, criarExercicio, atualizarExercicio } from "@/lib/services/treinos"
import { toast } from "sonner"

const exercicioSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
  tipo: z.enum(["superior", "inferior", "core", "cardio", "full_body"], {
    message: "Selecione o tipo de exercício.",
  }),
  grupo_muscular: z.string().min(1, "Selecione um grupo muscular."),
  instrucoes: z.string().optional(),
  video_url: z.string().url("Insira uma URL válida.").optional().or(z.literal("")),
})

export type ExercicioFormValues = z.infer<typeof exercicioSchema>

interface ExercicioFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exercicioToEdit?: Exercicio | null
  onSuccess: () => void
}

const TIPOS_EXERCICIO = [
  { value: "superior", label: "Superior" },
  { value: "inferior", label: "Inferior" },
  { value: "core", label: "Core" },
  { value: "cardio", label: "Cardio" },
  { value: "full_body", label: "Full Body" },
]

const GRUPOS_MUSCULARES = [
  { value: "peitoral", label: "Peitoral" },
  { value: "costas", label: "Costas" },
  { value: "ombros", label: "Ombros" },
  { value: "biceps", label: "Bíceps" },
  { value: "triceps", label: "Tríceps" },
  { value: "quadriceps", label: "Quadríceps" },
  { value: "posterior_coxa", label: "Posterior de Coxa" },
  { value: "gluteos", label: "Glúteos" },
  { value: "panturrilhas", label: "Panturrilhas" },
  { value: "abdomen", label: "Abdômen" },
  { value: "outro", label: "Outro" },
]

export function ExercicioFormDialog({
  open,
  onOpenChange,
  exercicioToEdit,
  onSuccess,
}: ExercicioFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ExercicioFormValues>({
    resolver: zodResolver(exercicioSchema),
    defaultValues: {
      nome: "",
      tipo: undefined,
      grupo_muscular: "",
      instrucoes: "",
      video_url: "",
    },
  })

  useEffect(() => {
    if (open) {
      if (exercicioToEdit) {
        form.reset({
          nome: exercicioToEdit.nome,
          tipo: exercicioToEdit.tipo,
          grupo_muscular: exercicioToEdit.grupo_muscular,
          instrucoes: exercicioToEdit.instrucoes || "",
          video_url: exercicioToEdit.video_url || "",
        })
      } else {
        form.reset({
          nome: "",
          tipo: undefined,
          grupo_muscular: "",
          instrucoes: "",
          video_url: "",
        })
      }
    }
  }, [open, exercicioToEdit, form])

  async function onSubmit(data: ExercicioFormValues) {
    setIsSubmitting(true)
    try {
      const payload = {
        ...data,
        video_url: data.video_url || undefined,
        instrucoes: data.instrucoes || undefined,
      }

      if (exercicioToEdit) {
        await atualizarExercicio(exercicioToEdit.id, payload as AtualizarExercicioPayload)
        toast.success("Exercício atualizado com sucesso!")
      } else {
        await criarExercicio(payload as CriarExercicioPayload)
        toast.success("Exercício criado com sucesso!")
      }
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar exercício. Verifique os dados e tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEditing = !!exercicioToEdit

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Exercício" : "Novo Exercício"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados do seu exercício personalizado."
              : "Preencha os dados para criar um novo exercício personalizado."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do exercício</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Supino reto com barra" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIPOS_EXERCICIO.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grupo_muscular"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grupo Muscular</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Grupo muscular" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GRUPOS_MUSCULARES.map((grupo) => (
                          <SelectItem key={grupo.value} value={grupo.value}>
                            {grupo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="instrucoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instruções (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva detalhes de postura, execução ou dicas especiais." 
                      className="resize-none" 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="video_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Vídeo (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: https://youtube.com/..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Link para um vídeo demonstrativo (YouTube, Vimeo, etc).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isEditing ? "Salvar alterações" : "Criar exercício"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
