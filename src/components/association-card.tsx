import Link from "next/link"
import { DissolvedBadge, OwnerStamp, ThemeBand } from "@/components/card-marks"
import { displayName, formatPlace, foundedYear, sentenceCase, shortThemeLabel } from "@/lib/format"
import type { SearchResult } from "@/lib/schemas/search-result"
import { cn } from "@/lib/utils"

// specimen: demonstration card on the home page, not linked to a real association.
export function AssociationCard({ result, specimen }: { result: SearchResult; specimen?: boolean }) {
  const place = formatPlace(result.city, result.postal_code)
  const year = foundedYear(result.founded_on)

  return (
    <article
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-xl bg-card ring-1 ring-border transition-shadow",
        "hover:shadow-[0_6px_18px_-8px_rgb(20_24_33/0.35)] hover:ring-primary/60 focus-within:ring-2 focus-within:ring-ring",
        !result.is_active && "bg-muted"
      )}
    >
      <ThemeBand themeCode={result.theme_code} />
      {!result.is_active && <div aria-hidden className="border-t-2 border-dashed border-muted-foreground/50" />}
      <div className="flex items-baseline justify-between gap-3 px-4 pt-3 font-mono text-xs text-muted-foreground">
        <span>{result.id}</span>
        {result.is_active ? year && <span>{year}</span> : <DissolvedBadge className="font-sans" />}
      </div>
      <h2 className={cn("px-4 pt-1.5 text-lg font-bold leading-snug text-balance", !result.is_active && "line-through decoration-2")}>
        {/* Stretched link: the whole card is clickable, the name stays the accessible label. */}
        {specimen ? (
          displayName(result.name)
        ) : (
          <Link href={`/association/${encodeURIComponent(result.id)}`} className="outline-none after:absolute after:inset-0">
            {displayName(result.name)}
          </Link>
        )}
      </h2>
      {place && <p className="px-4 pt-0.5 text-sm">{place}</p>}
      {result.description && (
        <p className="line-clamp-2 px-4 pt-2 text-sm text-muted-foreground">{sentenceCase(result.description)}</p>
      )}
      <div className="mt-auto flex items-end justify-between gap-3 px-4 pt-3 pb-4">
        <p className="text-xs font-semibold">
          {result.theme_label ? shortThemeLabel(result.theme_label) : "Thème non renseigné"}
        </p>
        {result.is_claimed && <OwnerStamp className="-my-2" />}
      </div>
    </article>
  )
}
