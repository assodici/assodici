import type { MetadataRoute } from "next"
import { siteUrl } from "@/lib/url"

// Every crawled page is a function invocation (Vercel Hobby): keep bots off result pages and private routes.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/search?", "/login", "/auth/", "/association/*/edit"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
