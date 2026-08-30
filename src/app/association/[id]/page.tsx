import { Suspense } from "react"
import { notFound } from "next/navigation"
import { createPublicClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLinkButton } from "@/components/buttons/external-link-button"

type Association = {
  id: string
  siret: string | null
  titre: string
  objet: string | null
  nature: string | null
  position: string | null
  groupement: string | null
  date_creat: string | null
  date_publi: string | null
  date_disso: string | null
  adrs_numvoie: string | null
  adrs_typevoie: string | null
  adrs_libvoie: string | null
  adrs_complement: string | null
  adrs_codepostal: string | null
  adrs_libcommune: string | null
  telephone: string | null
  email: string | null
  siteweb: string | null
}

const ASSOCIATION_COLUMNS =
  "id, siret, titre, objet, nature, position, groupement, date_creat, date_publi, date_disso, adrs_numvoie, adrs_typevoie, adrs_libvoie, adrs_complement, adrs_codepostal, adrs_libcommune, telephone, email, siteweb"

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

function AssociationSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-8 w-2/3 rounded bg-muted" />
      <div className="h-40 rounded bg-muted" />
    </div>
  )
}

async function AssociationDetails({ id }: { id: string }) {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from("associations")
    .select(ASSOCIATION_COLUMNS)
    .eq("id", id)
    .single<Association>()

  if (error || !data) notFound()

  const address = formatAddress(data)
  const createdAt = formatDate(data.date_creat)
  const publishedAt = formatDate(data.date_publi)
  const dissolvedAt = formatDate(data.date_disso)
  const website = safeWebsiteUrl(data.siteweb)
  const hasContact = Boolean(address || data.telephone || data.email || website)

  return (
    <div className="flex flex-col gap-6">
      <div>
        {dissolvedAt && (
          <p className="mb-1 text-xs font-medium text-destructive">
            Association dissoute le {dissolvedAt}
          </p>
        )}
        <h1 className="text-2xl font-bold tracking-tight">{data.titre}</h1>
        {data.position && <p className="mt-1 text-sm text-muted-foreground">{data.position}</p>}
      </div>

      {data.objet && (
        <Card>
          <CardHeader>
            <CardTitle>Objet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-line">{data.objet}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <InfoRow label="Numéro RNA" value={data.id} />
            {data.siret && <InfoRow label="SIRET" value={data.siret} />}
            {data.nature && <InfoRow label="Nature" value={data.nature} />}
            {data.groupement && <InfoRow label="Groupement" value={data.groupement} />}
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
            {data.telephone && <InfoRow label="Téléphone" value={data.telephone} />}
            {data.email && <InfoRow label="Email" value={data.email} />}
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
      <Suspense fallback={<AssociationSkeleton />}>
        {params.then(({ id }) => (
          <AssociationDetails id={id} />
        ))}
      </Suspense>
    </div>
  )
}
