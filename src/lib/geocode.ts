import { z } from "zod"

const NominatimResultSchema = z.array(
  z.object({
    lat: z.string(),
    lon: z.string(),
  })
)

// ponytail: Nominatim's usage policy caps this at ~1 req/sec; fine here
// since results are cached 30 days per address — move to a paid geocoder
// if traffic ever makes that the bottleneck.
export async function geocodeAddress(
  address: string
): Promise<{ latitude: number; longitude: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=fr&q=${encodeURIComponent(address)}`

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "assodici.fr (contact@assodici.fr)" },
      next: { revalidate: 60 * 60 * 24 * 30 },
    })
    if (!response.ok) return null

    const parsed = NominatimResultSchema.safeParse(await response.json())
    if (!parsed.success || parsed.data.length === 0) return null

    const [{ lat, lon }] = parsed.data
    return { latitude: Number(lat), longitude: Number(lon) }
  } catch (error) {
    console.error("Geocoding request failed:", error)
    return null
  }
}
