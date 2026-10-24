// Waldec uses 0001-01-01 as a "no date" sentinel instead of NULL (~86% of
// date_disso rows) — treat it as absent rather than rendering a bogus date.
export const NO_DATE = "0001-01-01"

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" })
export const numberFormatter = new Intl.NumberFormat("fr-FR")

function isRealDate(value: string | null | undefined): value is string {
  return Boolean(value) && value !== NO_DATE
}

export function formatDate(value: string | null | undefined): string | null {
  return isRealDate(value) ? dateFormatter.format(new Date(value)) : null
}

export function foundedYear(value: string | null | undefined): number | null {
  return isRealDate(value) ? new Date(value).getFullYear() : null
}

export function safeWebsiteUrl(value: string | null | undefined): string | null {
  if (!value) return null
  // Waldec often stores "www.example.fr" without a scheme.
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`
  try {
    const url = new URL(candidate)
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

// Gov labels arrive in capitals ("SPORTS, ACTIVITÉS DE PLEIN AIR") and titles too.
export function sentenceCase(value: string): string {
  const lower = value.toLocaleLowerCase("fr-FR").replace(/\s+/g, " ").trim()
  return lower.charAt(0).toLocaleUpperCase("fr-FR") + lower.slice(1)
}

const SMALL_WORDS = new Set(["à", "au", "aux", "d", "de", "des", "du", "en", "et", "l", "la", "le", "les", "par", "pour", "sur", "un", "une"])

// Only rewrite shouting names ("LE STADIUM OLYMPIQUE DES GONES" → "Le Stadium Olympique des Gones");
// names that already have some casing are kept as declared.
export function displayName(value: string): string {
  if (value !== value.toLocaleUpperCase("fr-FR")) return value
  return value
    .toLocaleLowerCase("fr-FR")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[\p{L}\p{N}]+/gu, (word, offset: number) =>
      offset > 0 && SMALL_WORDS.has(word) ? word : word.charAt(0).toLocaleUpperCase("fr-FR") + word.slice(1)
    )
}

export function formatPlace(city: string | null | undefined, postalCode: string | null | undefined): string | null {
  const place = [city ? displayName(city) : null, postalCode].filter(Boolean).join(" · ")
  return place || null
}

// "Culture, pratiques d'activités artistiques, …" → "Culture": enough to scan a result card.
export function shortThemeLabel(label: string): string {
  return sentenceCase(label.split(",")[0])
}
