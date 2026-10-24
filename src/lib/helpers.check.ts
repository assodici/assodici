// Assert-based self-check for the pure helpers (no test runner yet): bun run check
import assert from "node:assert/strict"
import { displayName, shortThemeLabel, safeWebsiteUrl, formatDate } from "@/lib/format"
import { safeNextPath } from "@/lib/url"
import { SearchParamsSchema } from "@/lib/schemas/search-params"
assert.equal(displayName("LE STADIUM OLYMPIQUE DES GONES"), "Le Stadium Olympique des Gones")
assert.equal(displayName("COMITE D'ACTION DE L'EST"), "Comite d'Action de l'Est")
assert.equal(displayName("Les Touches s'habillent"), "Les Touches s'habillent")
assert.equal(shortThemeLabel("CULTURE, PRATIQUES D'ACTIVITÉS"), "Culture")
assert.equal(safeWebsiteUrl("javascript:alert(1)"), null)
assert.equal(safeWebsiteUrl("www.asso.fr"), "https://www.asso.fr/")
assert.equal(formatDate("0001-01-01"), null)
for (const bad of ["//evil.com", "/\\evil.com", "https://evil.com", null]) assert.equal(safeNextPath(bad), "/")
assert.equal(safeNextPath("/association/W1"), "/association/W1")
const p = SearchParamsSchema.parse({ q: ["a", "b"], theme: "x';--", page: "999", dissoutes: "1" })
assert.deepEqual(p, { q: "", lieu: "", theme: "", dissoutes: true, page: 56 })
console.log("all checks passed")
