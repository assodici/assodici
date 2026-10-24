import type { MetadataRoute } from "next"
import { siteUrl } from "@/lib/url"

// Static pages only, by choice: listing 2.3M association pages would invite crawling beyond the Vercel free tier.
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/search", "/about", "/legal"].map((path) => ({ url: `${siteUrl()}${path}` }))
}
