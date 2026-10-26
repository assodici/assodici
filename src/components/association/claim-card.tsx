import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { claimAssociation } from "@/app/actions/profiles"
import { getUser } from "@/lib/supabase/server"
import type { Association } from "@/lib/associations"
import { cn } from "@/lib/utils"

const ctaClass = cn(buttonVariants(), "mt-4 h-11 w-full rounded-full text-base font-bold")

// Sits alone in its own card, away from navigation: claiming is the one consequential action here.
export async function ClaimCard({ association }: { association: Association }) {
  const user = await getUser()
  const path = `/association/${encodeURIComponent(association.id)}`

  if (association.owner) {
    if (association.owner.id !== user?.id) return null
    return (
      <section className="rounded-xl bg-card p-5 ring-2 ring-primary">
        <h2 className="font-bold">Vous gérez cette association</h2>
        <p className="mt-1 text-sm text-muted-foreground">Vos modifications remplacent les données publiques.</p>
        <Link href={`${path}/edit`} className={ctaClass}>
          Modifier les informations
        </Link>
      </section>
    )
  }

  if (!association.isActive) return null

  return (
    <section className="rounded-xl bg-card p-5 ring-1 ring-border">
      <h2 className="font-bold">C&apos;est votre association ?</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Revendiquez cette page pour corriger et compléter ses informations : description, adresse, contact, site.
      </p>
      {user ? (
        <form action={claimAssociation.bind(null, association.id)}>
          <button type="submit" className={ctaClass}>
            Revendiquer cette association
          </button>
          <p className="mt-2 text-xs text-muted-foreground">5 associations maximum par compte.</p>
        </form>
      ) : (
        <Link href={`/login?next=${encodeURIComponent(path)}`} className={ctaClass}>
          Se connecter pour la revendiquer
        </Link>
      )}
    </section>
  )
}
