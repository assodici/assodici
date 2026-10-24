// Waldec parent theme codes grouped into the nine colour families of the card band.
type ThemeFamily =
  | "sport"
  | "culture"
  | "solidarity"
  | "education"
  | "health"
  | "environment"
  | "civic"
  | "leisure"
  | "economy"

const FAMILY_BY_CODE: Record<string, ThemeFamily> = {
  "001000": "civic",
  "002000": "civic",
  "003000": "civic",
  "004000": "civic",
  "005000": "culture",
  "006000": "culture",
  "007000": "leisure",
  "009000": "leisure",
  "010000": "environment",
  "011000": "sport",
  "013000": "sport",
  "014000": "solidarity",
  "015000": "education",
  "016000": "education",
  "017000": "health",
  "018000": "health",
  "019000": "solidarity",
  "020000": "solidarity",
  "021000": "solidarity",
  "022000": "economy",
  "023000": "economy",
  "024000": "environment",
  "030000": "economy",
  "032000": "solidarity",
  "034000": "leisure",
  "036000": "health",
  "038000": "civic",
  "040000": "civic",
  "050000": "economy",
}

// Full literal class names: Tailwind's scanner cannot see classes built at runtime.
const BAND_CLASS: Record<ThemeFamily, string> = {
  sport: "bg-theme-sport",
  culture: "bg-theme-culture",
  solidarity: "bg-theme-solidarity",
  education: "bg-theme-education",
  health: "bg-theme-health",
  environment: "bg-theme-environment",
  civic: "bg-theme-civic",
  leisure: "bg-theme-leisure",
  economy: "bg-theme-economy",
}

export function themeBandClass(parentCode: string | null | undefined): string {
  const family = parentCode ? FAMILY_BY_CODE[parentCode] : undefined
  return family ? BAND_CLASS[family] : "bg-muted-foreground/40"
}

// Shortcuts on the home page; labels shortened from the official parent labels.
export const POPULAR_THEMES = [
  { code: "011000", label: "Sports" },
  { code: "006000", label: "Culture" },
  { code: "020000", label: "Solidarité" },
  { code: "015000", label: "Éducation" },
  { code: "024000", label: "Environnement" },
  { code: "007000", label: "Loisirs" },
] as const
