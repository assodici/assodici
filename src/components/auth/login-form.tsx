"use client"

import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { login } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LuLoader } from "react-icons/lu"

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null)

  useEffect(() => {
    if (state && "error" in state) {
      toast.error(state.error)
    }
  }, [state])

  if (state && "success" in state) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Vérifiez vos emails</CardTitle>
          <CardDescription>
            Un lien de connexion a été envoyé à votre adresse email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Cliquez sur le lien dans l&apos;email pour vous connecter. Vous
            pouvez fermer cette page.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Connexion</CardTitle>
        <CardDescription>
          Entrez votre email pour recevoir un lien de connexion
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="vous@exemple.fr"
              required
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <LuLoader className="animate-spin" />}
            Envoyer le lien
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
