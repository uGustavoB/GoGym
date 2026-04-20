import { Suspense } from "react"
import { RedefinirSenhaForm } from "@/components/redefinir-senha-form"
import { Loader2 } from "lucide-react"

export default function RedefinirSenhaPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin" /></div>}>
          <RedefinirSenhaForm />
        </Suspense>
      </div>
    </div>
  )
}
