import type { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://5thavenue.ie"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // Only public, indexable routes. Auth-gated and noindex routes
  // (/dashboard, /admin, /login, /signup) are excluded here and disallowed
  // in robots.ts.
  const routes: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
    { path: "", priority: 1.0, changeFrequency: "weekly" },
    { path: "/booking", priority: 0.9, changeFrequency: "daily" },
  ]

  return routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))
}
