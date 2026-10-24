"use client"

import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { login } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

// Same anatomy as an association card: ink band, then the content.
function LoginCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-card text-card-foreground shadow-[0_18px_40px_-20px_rgb(0_0_0/0.6)]">
      <div aria-hidden className="h-2.5 bg-foreground" />
      <div className="p-6">
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-1 text-muted-foreground">{description}</p>
        <div className="mt-5">{children}</div>
      </div>
    </section>
  )
}

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(login, null)

  useEffect(() => {
    if (!state) return
    if ("error" in state) toast.error(state.error)
    if ("success" in state) toast.success("Email envoyé ! Vérifiez votre boîte mail.")
  }, [state])

  if (state && "success" in state) {
    return (
      <LoginCard title="Vérifiez vos emails" description="Un lien de connexion a été envoyé à votre adresse email.">
        <p className="text-sm text-muted-foreground">
          Cliquez sur le lien dans l&apos;email pour vous connecter. Vous pouvez fermer cette page.
        </p>
      </LoginCard>
    )
  }

  return (
    <LoginCard title="Connexion" description="Recevez un lien de connexion par email, sans mot de passe.">
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Adresse email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="vous@exemple.fr"
            required
            className="h-11"
          />
        </div>

        <Button type="submit" disabled={isPending} className="h-11 w-full rounded-full text-base font-bold">
          {isPending && <Spinner />}
          Envoyer le lien
        </Button>
      </form>
    </LoginCard>
  )
}
