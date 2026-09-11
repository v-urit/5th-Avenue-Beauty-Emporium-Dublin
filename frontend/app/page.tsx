import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { HeroCarousel } from "@/components/hero-carousel"
import { MarqueeGallery } from "@/components/marquee-gallery"
import { ServicesSection } from "@/components/services-section"
import { TestimonialsSection } from "@/components/testimonials"
import { LocationHours } from "@/components/location-hours"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "5th Avenue Beauty Emporium | Luxury Nails & Spa in Dublin 2",
  description:
    "Dublin's premier beauty sanctuary at 45 Clarendon Street. Rated 4.9 from 1,755 Google reviews. Book signature manicures, spa pedicures and Japanese BIAB nail art online, 24/7.",
  alternates: { canonical: "/" },
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className="flex-grow">
        <HeroCarousel />
        <MarqueeGallery />
        <ServicesSection />
        <TestimonialsSection />
        <LocationHours />
      </main>
      <Footer />
    </div>
  )
}
