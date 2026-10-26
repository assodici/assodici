import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import { ProfileForm } from "@/components/association/profile-form"
import { ReleaseClaimButton } from "@/components/association/release-claim-button"
import { getAssociation, isAssociationId } from "@/lib/associations"
import { displayName } from "@/lib/format"
import { getUser, isSupabaseConfigured } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Modifier l'association", robots: { index: false } }

async function EditContent({ id }: { id: string }) {
  if (!isAssociationId(id) || !isSupabaseConfigured()) notFound()
  const path = `/association/${encodeURIComponent(id)}`

  const user = await getUser()
  if (!user) redirect(`/login?next=${encodeURIComponent(`${path}/edit`)}`)

  const association = await getAssociation(id)
  if (!association) notFound()
  // UX guard only: RLS refuses the update for anyone but the owner.
  if (association.owner?.id !== user.id) redirect(path)

  return (
    <>
      <section className="bg-shell text-shell-foreground">
        <div className="page-container py-8 sm:py-10">
          <p className="font-mono text-sm text-shell-muted">{association.id}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            Modifier « {displayName(association.name)} »
          </h1>
        </div>
      </section>
      <div className="page-container max-w-3xl py-10">
        <ProfileForm
          associationId={association.id}
          values={{
            name: association.name,
            description: association.description,
            address: association.address,
            postal_code: association.postalCode,
            city: association.city,
            email: association.email,
            phone: association.phone,
            website: association.website,
          }}
        />
        <section className="mt-12 border-t pt-8">
          <h2 className="text-lg font-extrabold">Ne plus gérer cette association</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            Vos modifications seront supprimées et quelqu&apos;un d&apos;autre pourra la revendiquer.
          </p>
          <ReleaseClaimButton associationId={association.id} />
        </section>
      </div>
    </>
  )
}

export default function EditAssociationPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<section className="h-40 bg-shell" />}>
      {params.then(({ id }) => (
        <EditContent id={id} />
      ))}
    </Suspense>
  )
}
