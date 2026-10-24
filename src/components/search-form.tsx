import Link from "next/link"
import { ChevronDown, MapPin, Search } from "lucide-react"
import { SubmitOnChange } from "@/components/submit-on-change"
import { searchHref, type SearchParams } from "@/lib/schemas/search-params"
import { cn } from "@/lib/utils"

type SearchFormProps = {
  size: "hero" | "bar"
  values?: Partial<SearchParams>
  // Passing themes turns on the filter row (search page).
  themes?: { code: string; label: string }[]
}

const fieldClass =
  "h-full w-full min-w-0 bg-transparent text-foreground placeholder:text-muted-foreground outline-none"

// A plain GET form to /search: works without JS, and the URL is the search state.
export function SearchForm({ size, values = {}, themes }: SearchFormProps) {
  const hero = size === "hero"
  const hasFilters = Boolean(values.theme || values.dissoutes)

  return (
    <form action="/search" role="search" className="flex flex-col gap-3">
      <div
        className={cn(
          "grid overflow-hidden rounded-2xl bg-shell-field shadow-[0_10px_30px_-12px_rgb(0_0_0/0.45)] ring-white/20 sm:grid-cols-[1fr_minmax(15rem,20rem)_auto]",
          "focus-within:ring-4",
          hero ? "text-lg sm:h-[4.75rem]" : "sm:h-14"
        )}
      >
        <label className="flex h-14 items-center gap-3 px-5 sm:h-auto">
          <Search aria-hidden className="size-5 shrink-0 text-muted-foreground" />
          <span className="sr-only">Que cherchez-vous ?</span>
          <input
            name="q"
            type="search"
            defaultValue={values.q}
            placeholder="Nom, activité, centre d'intérêt…"
            autoFocus={hero}
            autoComplete="off"
            maxLength={200}
            className={fieldClass}
          />
        </label>
        <label className="flex h-14 items-center gap-3 border-t border-border px-5 sm:h-auto sm:border-t-0 sm:border-l">
          <MapPin aria-hidden className="size-5 shrink-0 text-muted-foreground" />
          <span className="sr-only">Où ?</span>
          <input
            name="lieu"
            defaultValue={values.lieu}
            placeholder="Ville, CP ou département"
            autoComplete="address-level2"
            maxLength={100}
            className={fieldClass}
          />
        </label>
        <button
          type="submit"
          className={cn(
            "h-14 bg-foreground px-8 font-bold text-background transition-colors hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-inset sm:h-auto",
            hero && "sm:px-10"
          )}
        >
          Rechercher
        </button>
      </div>

      {themes && (
        <SubmitOnChange className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-shell-foreground">
          <label className="flex items-center gap-2">
            <span className="font-semibold">Thème</span>
            <span className="relative">
            <select
              name="theme"
              defaultValue={values.theme}
              className="h-9 w-[16rem] appearance-none truncate rounded-lg bg-shell-field pr-9 pl-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-80"
            >
              <option value="">Tous les thèmes</option>
              {themes.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="dissoutes"
              value="1"
              defaultChecked={values.dissoutes}
              className="size-4 accent-white"
            />
            Inclure les associations dissoutes
          </label>
          {hasFilters && (
            <Link
              href={searchHref({ q: values.q, lieu: values.lieu })}
              className="font-semibold underline"
            >
              Retirer les filtres
            </Link>
          )}
        </SubmitOnChange>
      )}
    </form>
  )
}
