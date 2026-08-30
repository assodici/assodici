import { Suspense } from "react"
import { notFound } from "next/navigation"
import { z } from "zod"
import { createPublicClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLinkButton } from "@/components/buttons/external-link-button"

const AssociationSchema = z.object({
  id: z.string(),
  siret: z.string().nullable(),
  titre: z.string(),
  objet: z.string().nullable(),
  nature: z.string().nullable(),
  position: z.string().nullable(),
  groupement: z.string().nullable(),
  date_creat: z.string().nullable(),
  date_publi: z.string().nullable(),
  date_disso: z.string().nullable(),
  adrs_numvoie: z.string().nullable(),
  adrs_typevoie: z.string().nullable(),
  adrs_libvoie: z.string().nullable(),
  adrs_complement: z.string().nullable(),
  adrs_codepostal: z.string().nullable(),
  adrs_libcommune: z.string().nullable(),
  telephone: z.string().nullable(),
  email: z.string().nullable(),
  siteweb: z.string().nullable(),
})

type Association = z.infer<typeof AssociationSchema>

function safeWebsiteUrl(value: string | null): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

function formatAddress(a: Association): string | null {
  const street = [a.adrs_numvoie, a.adrs_typevoie, a.adrs_libvoie].filter(Boolean).join(" ")
  const city = [a.adrs_codepostal, a.adrs_libcommune].filter(Boolean).join(" ")
  const parts = [a.adrs_complement, street, city].filter(Boolean)
  return parts.length ? parts.join(", ") : null
}

// Waldec uses 0001-01-01 as a "no date" sentinel instead of NULL (~86% of
// date_disso rows) — treat it as absent rather than rendering a bogus date.
const NO_DATE = "0001-01-01"

function formatDate(value: string | null): string | null {
  return value && value !== NO_DATE
    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(value))
    : null
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}

async function AssociationDetails({ id }: { id: string }) {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from("associations")
    .select(
      "id, siret, titre, objet, nature, position, groupement, date_creat, date_publi, date_disso, adrs_numvoie, adrs_typevoie, adrs_libvoie, adrs_complement, adrs_codepostal, adrs_libcommune, telephone, email, siteweb"
    )
    .eq("id", id)
    .single()

  if (error || !data) notFound()

  const parsed = AssociationSchema.safeParse(data)
  if (!parsed.success) {
    console.error(`associations row ${id} has an unexpected shape:`, parsed.error)
    notFound()
  }

  const association = parsed.data
  const address = formatAddress(association)
  const createdAt = formatDate(association.date_creat)
  const publishedAt = formatDate(association.date_publi)
  const dissolvedAt = formatDate(association.date_disso)
  const website = safeWebsiteUrl(association.siteweb)
  const hasContact = Boolean(address || association.telephone || association.email || website)

  return (
    <div className="flex flex-col gap-6">
      <div>
        {dissolvedAt && (
          <p className="mb-1 text-xs font-medium text-destructive">
            Association dissoute le {dissolvedAt}
          </p>
        )}
        <h1 className="text-2xl font-bold tracking-tight">{association.titre}</h1>
        {association.position && (
          <p className="mt-1 text-sm text-muted-foreground">{association.position}</p>
        )}
      </div>

      {association.objet && (
        <Card>
          <CardHeader>
            <CardTitle>Objet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-line">{association.objet}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <InfoRow label="Numéro RNA" value={association.id} />
            {association.siret && <InfoRow label="SIRET" value={association.siret} />}
            {association.nature && <InfoRow label="Nature" value={association.nature} />}
            {association.groupement && (
              <InfoRow label="Groupement" value={association.groupement} />
            )}
            {createdAt && <InfoRow label="Création" value={createdAt} />}
            {publishedAt && <InfoRow label="Publication JO" value={publishedAt} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {address && <InfoRow label="Adresse" value={address} />}
            {association.telephone && <InfoRow label="Téléphone" value={association.telephone} />}
            {association.email && <InfoRow label="Email" value={association.email} />}
            {website && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Site web</span>
                <ExternalLinkButton
                  href={website}
                  showText
                  variant="link"
                  className="h-auto p-0 text-right"
                >
                  {website}
                </ExternalLinkButton>
              </div>
            )}
            {!hasContact && (
              <p className="text-muted-foreground">Aucune information de contact disponible.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AssociationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <div className="page-container py-8">
      <Suspense
        fallback={
          <div className="flex animate-pulse flex-col gap-6">
            <div className="h-8 w-2/3 rounded bg-muted" />
            <div className="h-40 rounded bg-muted" />
          </div>
        }
      >
        {params.then(({ id }) => (
          <AssociationDetails id={id} />
        ))}
      </Suspense>
    </div>
  )
}
