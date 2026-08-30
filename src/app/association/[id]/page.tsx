import { Suspense } from "react"
import { notFound } from "next/navigation"
import { z } from "zod"
import { createPublicClient } from "@/lib/supabase/server"

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

// Waldec uses 0001-01-01 as a "no date" sentinel instead of NULL (~86% of
// date_disso rows) — treat it as absent rather than rendering a bogus date.
const NO_DATE = "0001-01-01"

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" })

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

function formatDate(value: string | null): string | null {
  return value && value !== NO_DATE ? dateFormatter.format(new Date(value)) : null
}

function foundedYear(value: string | null): number | null {
  return value && value !== NO_DATE ? new Date(value).getFullYear() : null
}

function StubActionCard({ title, cta }: { title: string; cta: string }) {
  return (
    <div className="rounded-2xl bg-brand-cream p-6 text-center">
      <h2 className="font-heading text-lg text-brand-dark">{title}</h2>
      <p className="mt-2 text-xs text-muted-foreground">
        Critères, âge, prix de l&apos;adhésion, jour d&apos;activité... — bientôt disponible.
      </p>
      <button
        type="button"
        disabled
        className="mt-4 w-full cursor-not-allowed rounded-2xl bg-brand-blue/40 py-2 text-sm text-white"
      >
        {cta}
      </button>
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
  const dissolvedAt = formatDate(association.date_disso)
  const since = foundedYear(association.date_creat)
  const website = safeWebsiteUrl(association.siteweb)
  const mapsUrl = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : null

  return (
    <div className="flex flex-col">
      <div className="bg-brand-blue text-white">
        <div className="page-container flex flex-wrap items-center gap-6 py-10">
          <div className="h-28 w-28 shrink-0 rounded-2xl bg-white/20" aria-hidden />
          <div className="flex flex-col gap-2">
            {dissolvedAt && (
              <p className="text-xs font-medium text-brand-yellow">
                Association dissoute le {dissolvedAt}
              </p>
            )}
            <h1 className="font-heading text-2xl leading-tight sm:text-3xl">{association.titre}</h1>
            <div className="flex flex-wrap gap-x-8 gap-y-1 text-sm text-white/90">
              {association.adrs_libcommune && <span>{association.adrs_libcommune}</span>}
              {since && <span>Depuis {since}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-brand-green">
        <div className="page-container grid gap-6 py-10 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-6">
            {association.objet && (
              <div className="rounded-2xl bg-brand-cream p-6">
                <h2 className="font-heading text-lg text-brand-dark">à propos</h2>
                <p className="mt-4 text-sm whitespace-pre-line text-brand-dark/80">
                  {association.objet}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <StubActionCard title="devenir adhérent" cta="Rejoindre l'asso" />
            <StubActionCard title="devenir bénévole" cta="Proposer mon aide" />

            <div className="rounded-2xl bg-brand-cream p-6">
              <h2 className="font-heading text-lg text-brand-dark">infos pratiques</h2>
              <div className="mt-4 flex flex-col gap-2 text-sm text-brand-dark/80">
                {address && <p>{address}</p>}
                {association.telephone && <p>{association.telephone}</p>}
                {association.email && <p>{association.email}</p>}
                {website && (
                  <a href={website} target="_blank" rel="noopener noreferrer" className="underline">
                    {website}
                  </a>
                )}
                {!address && !association.telephone && !association.email && !website && (
                  <p className="text-muted-foreground">Aucune information disponible.</p>
                )}
              </div>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block rounded-2xl bg-brand-blue py-2 text-center text-sm text-white"
                >
                  Voir sur la carte
                </a>
              )}
            </div>
          </div>
        </div>
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
    <Suspense
      fallback={
        <div className="flex animate-pulse flex-col gap-6 py-10">
          <div className="page-container h-32 rounded-2xl bg-muted" />
          <div className="page-container h-64 rounded-2xl bg-muted" />
        </div>
      }
    >
      {params.then(({ id }) => (
        <AssociationDetails id={id} />
      ))}
    </Suspense>
  )
}
