import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://5thavenue.ie"

/**
 * Canonical metadata helper for every public page. Centralizing it here keeps
 * titles, descriptions, OpenGraph and Twitter cards consistent and guarantees
 * each page emits a canonical URL — the baseline Google expects for strong
 * local + brand ranking.
 */
export function buildPageMetadata({
  title,
  description,
  path = "",
  image = "/images/hero_salon.jpg",
  keywords,
}: {
  title: string
  description: string
  path?: string
  image?: string
  keywords?: string[]
}): Metadata {
  const url = `${SITE_URL}${path}`
  const fullTitle = title.includes("5th Avenue")
    ? title
    : `${title} | 5th Avenue Beauty Emporium`

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: "5th Avenue Beauty Emporium",
      locale: "en_IE",
      type: "website",
      images: [
        {
          url: `${SITE_URL}${image}`,
          width: 1200,
          height: 630,
          alt: "5th Avenue Beauty Emporium — luxury nail and spa sanctuary in Dublin",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [`${SITE_URL}${image}`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}
