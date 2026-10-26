export function siteUrl(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  return "http://localhost:3000"
}

// Only same-site paths. Parse like a browser would: "//evil.com", "/\evil.com" and "/\t/evil.com" all leave the site.
export function safeNextPath(value: string | null | undefined): string {
  if (!value?.startsWith("/")) return "/"
  const base = "http://same.site"
  const url = new URL(value, base)
  return url.origin === base ? url.pathname + url.search + url.hash : "/"
}
