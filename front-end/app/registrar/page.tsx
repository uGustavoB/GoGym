import { RegisterForm } from "@/components/register-form"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  )
}
