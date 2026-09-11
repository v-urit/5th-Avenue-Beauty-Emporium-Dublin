import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { JsonLd } from "@/components/json-ld";
import { DemoBadge } from "@/components/demo-badge";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://5thavenue.ie";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "5th Avenue Beauty Emporium | Luxury Nails & Spa in Dublin 2",
    template: "%s | 5th Avenue Beauty Emporium",
  },
  description:
    "Dublin's premier beauty sanctuary at 45 Clarendon Street. Rated 4.9 from 1,755 Google reviews. 24/7 online booking for signature manicures, spa pedicures, and Japanese BIAB nail art. Open daily until 20:00.",
  keywords: [
    "manicure Dublin",
    "pedicure Dublin",
    "5th Avenue Beauty Emporium",
    "Clarendon Street salon",
    "BIAB Dublin",
    "luxury nail salon Ireland",
    "spa pedicure Dublin",
    "nail salon Dublin 2",
  ],
  authors: [{ name: "5th Avenue Beauty Emporium" }],
  creator: "5th Avenue Beauty Emporium",
  publisher: "5th Avenue Beauty Emporium",
  applicationName: "5th Avenue Beauty Emporium",
  formatDetection: {
    telephone: true,
    address: true,
  },
  alternates: {
    canonical: "/",
  },
  category: "beauty",
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: SITE_URL,
    siteName: "5th Avenue Beauty Emporium",
    title: "5th Avenue Beauty Emporium | Luxury Nails & Spa in Dublin 2",
    description:
      "Dublin's premier beauty sanctuary at 45 Clarendon Street. Rated 4.9 from 1,755 Google reviews. Open daily until 20:00.",
    images: [
      {
        url: "/images/hero_salon.jpg",
        width: 1200,
        height: 630,
        alt: "5th Avenue Beauty Emporium — luxury nail salon interior in Dublin",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "5th Avenue Beauty Emporium | Luxury Nails & Spa in Dublin 2",
    description:
      "Dublin's premier beauty sanctuary at 45 Clarendon Street. Rated 4.9 from 1,755 Google reviews. Open daily until 20:00.",
    images: ["/images/hero_salon.jpg"],
    creator: "@5thavenue",
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
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfbf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0c0b" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
        {/* Structured data for local search / Google rich results */}
        <JsonLd />
        {/* Interactive Demo Controller (Role Switcher & Reset) */}
        <DemoBadge />
      </body>
    </html>
  );
}
