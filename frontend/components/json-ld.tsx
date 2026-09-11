/**
 * Server-rendered JSON-LD structured data.
 *
 * For a physical salon, LocalBusiness (BeautySalon subtype) markup is the
 * single highest-impact SEO element: it feeds Google Maps / local pack and
 * powers rich results (rating stars, opening hours, booking action).
 * Rendered once in the root layout so every page inherits it.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://5thavenue.ie"

const localBusiness = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  "@id": `${SITE_URL}/#salon`,
  name: "5th Avenue Beauty Emporium",
  url: SITE_URL,
  image: `${SITE_URL}/images/hero_salon.jpg`,
  logo: `${SITE_URL}/images/hero_salon.jpg`,
  description:
    "Dublin's premier luxury nail and spa sanctuary at 45 Clarendon Street. Signature manicures, spa pedicures, Japanese BIAB nail art and paraffin hand treatments. Rated 4.9 from 1,755 Google reviews. 24/7 online booking.",
  telephone: "+353 1 671 2345",
  priceRange: "€€€",
  currenciesAccepted: "EUR",
  paymentAccepted: "Cash, Credit Card, Debit Card",
  address: {
    "@type": "PostalAddress",
    streetAddress: "45 Clarendon Street",
    addressLocality: "Dublin",
    addressRegion: "Dublin",
    postalCode: "D02",
    addressCountry: "IE",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 53.3418,
    longitude: -6.2551,
  },
  hasMap: `${SITE_URL}/#location`,
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "09:30",
      closes: "20:00",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "1755",
    bestRating: "5",
    worstRating: "1",
  },
  sameAs: [
    "https://www.instagram.com/5thavenue",
    "https://www.facebook.com/5thavenue",
  ],
  makesOffer: {
    "@type": "OfferCatalog",
    name: "Treatments",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Signature Gel Manicure" },
        price: "55",
        priceCurrency: "EUR",
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Royal Rose Petal Spa Pedicure" },
        price: "75",
        priceCurrency: "EUR",
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Japanese BIAB & 24k Gold Flakes" },
        price: "90",
        priceCurrency: "EUR",
      },
    ],
  },
  potentialAction: {
    "@type": "ReserveAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/booking`,
      actionPlatform: [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform",
      ],
    },
    name: "Book an appointment",
  },
}

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "5th Avenue Beauty Emporium",
  publisher: { "@id": `${SITE_URL}/#salon` },
}

export function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  )
}
