"use client"

import { useActionState } from "react"
import Link from "next/link"
import { updateProfile, type ProfileFormState } from "@/app/actions/profiles"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import type { Profile } from "@/lib/schemas/profile"
import { cn } from "@/lib/utils"

type FieldProps = {
  name: keyof Profile
  label: string
  hint?: string
  defaultValue: string | null
  state: ProfileFormState
  multiline?: boolean
} & Omit<React.ComponentProps<"input">, "name" | "defaultValue">

function Field({ name, label, hint, defaultValue, state, multiline, className, ...props }: FieldProps) {
  const error = state?.fieldErrors?.[name]
  const describedBy = [hint && `${name}-hint`, error && `${name}-error`].filter(Boolean).join(" ") || undefined
  const shared = {
    id: name,
    name,
    defaultValue: defaultValue ?? "",
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  }
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={name}>{label}</Label>
      {multiline ? <Textarea {...shared} rows={8} maxLength={5000} /> : <Input {...shared} {...props} className="h-10" />}
      {hint && <p id={`${name}-hint`} className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p id={`${name}-error`} className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  )
}

export function ProfileForm({ associationId, values }: { associationId: string; values: Profile }) {
  const [state, formAction, isPending] = useActionState(updateProfile.bind(null, associationId), null)
  const common = { state }

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {state?.error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 font-medium text-destructive">
          {state.error}
        </p>
      )}

      <fieldset className="grid gap-5">
        <legend className="mb-4 text-lg font-extrabold">Présentation</legend>
        <Field {...common} name="name" label="Nom affiché" defaultValue={values.name} maxLength={250} />
        <Field
          {...common}
          name="description"
          label="Description"
          hint="Activités, public, horaires, tarifs : ce qu'un visiteur doit savoir."
          defaultValue={values.description}
          multiline
        />
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-[1fr_9rem_1fr]">
        <legend className="mb-4 text-lg font-extrabold">Adresse</legend>
        <Field {...common} name="address" label="Adresse" defaultValue={values.address} maxLength={250} autoComplete="street-address" />
        <Field {...common} name="postal_code" label="Code postal" defaultValue={values.postal_code} inputMode="numeric" maxLength={5} autoComplete="postal-code" />
        <Field {...common} name="city" label="Ville" defaultValue={values.city} maxLength={100} autoComplete="address-level2" />
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 text-lg font-extrabold">Contact public</legend>
        <Field {...common} name="email" label="Email" type="email" defaultValue={values.email} maxLength={254} />
        <Field {...common} name="phone" label="Téléphone" type="tel" defaultValue={values.phone} maxLength={30} />
        <Field
          {...common}
          name="website"
          label="Site web"
          type="url"
          placeholder="https://"
          defaultValue={values.website}
          maxLength={500}
          className="sm:col-span-2"
        />
      </fieldset>

      <p className="text-sm text-muted-foreground">
        Ces informations sont publiques. Un champ laissé vide affiche les données officielles du RNA.
      </p>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isPending} className="h-11 rounded-full px-6 text-base font-bold">
          {isPending && <Spinner />}
          Enregistrer
        </Button>
        <Link
          href={`/association/${encodeURIComponent(associationId)}`}
          className={cn(buttonVariants({ variant: "outline" }), "h-11 rounded-full px-6 text-base")}
        >
          Annuler
        </Link>
      </div>
    </form>
  )
}
