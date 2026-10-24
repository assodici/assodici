import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react"
import { AssociationMap } from "@/components/association-map"
import { ClaimCard } from "@/components/claim-card"
import { DissolvedBadge, OwnerStamp, ThemeBand } from "@/components/card-marks"
import { getAssociation, isAssociationId, type Association } from "@/lib/associations"
import { displayName, formatDate, formatPlace, foundedYear, safeWebsiteUrl, sentenceCase } from "@/lib/format"
import { isSupabaseConfigured } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

type Params = Promise<{ id: string }>

async function load(id: string): Promise<Association | null> {
  if (!isAssociationId(id) || !isSupabaseConfigured()) return null
  return getAssociation(id)
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const association = await load((await params).id).catch(() => null)
  if (!association) return { title: "Association introuvable" }
  const place = formatPlace(association.city, association.postalCode)
  const title = displayName(association.name)
  const description = [place, association.description?.slice(0, 150)].filter(Boolean).join(" · ")
  return {
    title,
    description,
    alternates: { canonical: `/association/${encodeURIComponent(association.id)}` },
    openGraph: { title, description },
  }
}

// schema.org data for search engines. "<" is escaped so user-provided text can't close the script tag.
function JsonLd({ a, website }: { a: Association; website: string | null }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: displayName(a.name),
    description: a.description ?? undefined,
    identifier: a.id,
    foundingDate: formatDate(a.foundedOn) ? a.foundedOn : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: a.address ?? undefined,
      postalCode: a.postalCode ?? undefined,
      addressLocality: a.city ? displayName(a.city) : undefined,
      addressCountry: "FR",
    },
    email: a.email ?? undefined,
    telephone: a.phone ?? undefined,
    url: website ?? undefined,
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  )
}

function Fact({ label, value, mono }: { label: string; value: string | null; mono?: boolean }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-4 py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("text-right", mono && "font-mono")}>{value}</dd>
    </div>
  )
}

function ContactLine({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span aria-hidden className="mt-0.5 text-muted-foreground [&_svg]:size-4">
        {icon}
      </span>
      <span className="min-w-0 break-words">{children}</span>
    </li>
  )
}

async function AssociationDetails({ id }: { id: string }) {
  const association = await load(id)
  if (!association) notFound()

  const a = association
  const name = displayName(a.name)
  const place = formatPlace(a.city, a.postalCode)
  const fullAddress = [a.address, [a.postalCode, a.city && displayName(a.city)].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ")
  const website = safeWebsiteUrl(a.website)
  const year = foundedYear(a.foundedOn)
  const dissolvedOn = formatDate(a.dissolvedOn)
  const hasContact = Boolean(fullAddress || a.email || a.phone || website)

  return (
    <>
      {a.isActive && <JsonLd a={a} website={website} />}
      <section className="bg-shell">
        <div className="page-container py-8 sm:py-12">
          <article className={cn("relative overflow-hidden rounded-2xl bg-card shadow-[0_18px_40px_-20px_rgb(0_0_0/0.6)]", !a.isActive && "bg-muted")}>
            <ThemeBand themeCode={a.themeCode} className="h-4" />
            {!a.isActive && <div aria-hidden className="border-t-2 border-dashed border-muted-foreground/60" />}
            <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-sm text-muted-foreground">
                  <span>{a.id}</span>
                  {year && <span>Depuis {year}</span>}
                  {!a.isActive && <DissolvedBadge className="font-sans text-foreground" />}
                </p>
                <h1
                  className={cn(
                    "mt-3 text-3xl leading-tight font-extrabold tracking-[-0.02em] text-balance sm:text-5xl",
                    !a.isActive && "line-through decoration-[3px]"
                  )}
                >
                  {name}
                </h1>
                <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-lg">
                  {place && <span>{place}</span>}
                  {a.themeLabel && <span className="font-semibold">{a.themeLabel}</span>}
                </p>
                {a.subthemeLabel && <p className="mt-1 text-muted-foreground">{a.subthemeLabel}</p>}
                {dissolvedOn && <p className="mt-3 font-semibold">Dissoute le {dissolvedOn}.</p>}
              </div>
              {a.owner && <OwnerStamp size="lg" className="self-end" />}
            </div>
          </article>
        </div>
      </section>

      <div className="page-container grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="text-xl font-extrabold tracking-tight">Présentation</h2>
            {a.description ? (
              <p className="mt-3 max-w-prose whitespace-pre-line text-pretty">{sentenceCase(a.description)}</p>
            ) : (
              <p className="mt-3 text-muted-foreground">Aucune description n&apos;a été déclarée.</p>
            )}
            {a.owner && (
              <p className="mt-4 text-sm text-muted-foreground">
                Informations fournies par l&apos;association, mises à jour le {formatDate(a.owner.updatedAt)}.
                {a.name !== a.officialName && <> Nom déclaré au RNA : {displayName(a.officialName)}.</>}
              </p>
            )}
          </section>
          {fullAddress && <AssociationMap address={fullAddress} title={name} className="h-72" />}
        </div>

        <aside className="flex flex-col gap-6">
          <section className="rounded-xl bg-card p-5 ring-1 ring-border">
            <h2 className="font-bold">Coordonnées</h2>
            {hasContact ? (
              <ul className="mt-3 flex flex-col gap-3 text-sm">
                {fullAddress && <ContactLine icon={<MapPin />}>{fullAddress}</ContactLine>}
                {a.email && (
                  <ContactLine icon={<Mail />}>
                    <a href={`mailto:${a.email}`} className="underline">{a.email}</a>
                  </ContactLine>
                )}
                {a.phone && (
                  <ContactLine icon={<Phone />}>
                    <a href={`tel:${a.phone.replace(/\s/g, "")}`} className="underline">{a.phone}</a>
                  </ContactLine>
                )}
                {website && (
                  <ContactLine icon={<ExternalLink />}>
                    <a href={website} target="_blank" rel="noopener noreferrer nofollow" className="underline">
                      {website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                    </a>
                  </ContactLine>
                )}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Aucune coordonnée publiée.</p>
            )}
          </section>

          <Suspense fallback={null}>
            <ClaimCard association={a} />
          </Suspense>

          <section className="rounded-xl bg-card p-5 ring-1 ring-border">
            <h2 className="font-bold">Fiche officielle</h2>
            <dl className="mt-2 divide-y divide-border text-sm">
              <Fact label="N° RNA" value={a.id} mono />
              <Fact label="SIRET" value={a.siret} mono />
              <Fact label="Création" value={formatDate(a.foundedOn)} />
              <Fact label="Publication au JO" value={formatDate(a.publishedOn)} />
              <Fact label="Dissolution" value={dissolvedOn} />
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">Source : Répertoire national des associations.</p>
          </section>
        </aside>
      </div>
    </>
  )
}

export default function AssociationPage({ params }: { params: Params }) {
  return (
    <Suspense
      fallback={
        <section className="bg-shell">
          <div className="page-container py-12">
            <div className="h-56 animate-pulse rounded-2xl bg-card/80" />
          </div>
        </section>
      }
    >
      {params.then(({ id }) => (
        <AssociationDetails id={id} />
      ))}
    </Suspense>
  )
}
